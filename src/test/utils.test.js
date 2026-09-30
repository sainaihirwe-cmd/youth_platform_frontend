import { describe, expect, it } from 'vitest';
import { formatSalary, validateFile, initials, daysUntil } from '../utils/format';
import { seekerProfileCompletion, employerProfileCompletion } from '../utils/profileCompletion';
import { cleanParams } from '../services/jobService';
import { applyServerErrors } from '../utils/formErrors';

describe('formatSalary', () => {
  it('formats ranges with the payment period', () => {
    expect(formatSalary({ min: 300000, max: 500000, currency: 'RWF' }, 'monthly')).toMatch(/300.000 - 500.000 RWF \/ month/);
  });
  it('handles single values, negotiable and missing pay', () => {
    expect(formatSalary({ min: 5000 }, 'daily')).toMatch(/5.000 RWF \/ day/);
    expect(formatSalary({}, 'negotiable')).toBe('Negotiable');
    expect(formatSalary(undefined, 'monthly')).toBe('Pay not specified');
  });
});

describe('validateFile', () => {
  const opts = { extensions: ['pdf', 'doc', 'docx'], maxMb: 5 };
  it('accepts allowed files', () => {
    expect(validateFile(new File(['x'], 'cv.PDF'), opts)).toBeNull();
  });
  it('rejects wrong types and oversized files', () => {
    expect(validateFile(new File(['x'], 'cv.exe'), opts).key).toBe('validation.fileType');
    const big = new File(['x'], 'cv.pdf');
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });
    expect(validateFile(big, opts).key).toBe('validation.fileSize');
  });
});

describe('profile completion', () => {
  it('scores an empty and a complete seeker profile', () => {
    expect(seekerProfileCompletion({ name: 'A' }).percent).toBe(11);
    const full = {
      name: 'Aline',
      phone: '+250788000000',
      location: 'Gasabo',
      profileImage: '/x.png',
      professionalSummary: 'An experienced waiter with excellent customer skills.',
      skills: ['a', 'b', 'c'],
      education: [{}],
      experience: [{}],
      resumeUrl: '/api/files/resumes/x.pdf',
    };
    expect(seekerProfileCompletion(full)).toEqual({ percent: 100, missing: [] });
  });
  it('lists missing employer items', () => {
    const r = employerProfileCompletion({ companyName: 'Co' }, {});
    expect(r.missing).toContain('companyLogo');
    expect(r.percent).toBeLessThan(50);
  });
});

describe('helpers', () => {
  it('builds initials and deadlines', () => {
    expect(initials('Jean Claude Habimana')).toBe('JC');
    expect(daysUntil(new Date(Date.now() + 2.5 * 86400000))).toBe(3);
  });
  it('drops empty query params', () => {
    expect(cleanParams({ q: '', location: 'Gasabo', jobType: [], page: 2, x: null })).toEqual({ location: 'Gasabo', page: 2 });
  });
  it('maps server validation errors to form fields', () => {
    const calls = [];
    const ok = applyServerErrors({ errors: [{ field: 'salary.min', message: 'bad' }] }, (f, e) => calls.push([f, e.message]), { 'salary.min': 'salaryMin' });
    expect(ok).toBe(true);
    expect(calls).toEqual([['salaryMin', 'bad']]);
  });
});
