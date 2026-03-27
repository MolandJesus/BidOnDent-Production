import { describe, expect, it } from "vitest";
import {
  formatPhoneNumber,
  unformatPhoneNumber,
  formatVIN,
  formatLicensePlate,
  isValidEmail,
  formatCurrency,
} from "./formatters";

describe("formatPhoneNumber", () => {
  it("returns empty string for empty input", () => {
    expect(formatPhoneNumber("")).toBe("");
  });

  it("formats partial area code", () => {
    expect(formatPhoneNumber("55")).toBe("(55");
  });

  it("formats full area code", () => {
    expect(formatPhoneNumber("555")).toBe("(555");
  });

  it("formats area code + prefix", () => {
    expect(formatPhoneNumber("555123")).toBe("(555) 123");
  });

  it("formats full 10-digit number", () => {
    expect(formatPhoneNumber("5551234567")).toBe("(555) 123-4567");
  });

  it("strips non-digit chars before formatting", () => {
    expect(formatPhoneNumber("(555) 123-4567")).toBe("(555) 123-4567");
  });

  it("truncates beyond 10 digits", () => {
    expect(formatPhoneNumber("55512345678999")).toBe("(555) 123-4567");
  });
});

describe("unformatPhoneNumber", () => {
  it("strips formatting", () => {
    expect(unformatPhoneNumber("(555) 123-4567")).toBe("5551234567");
  });

  it("returns digits from already-plain input", () => {
    expect(unformatPhoneNumber("5551234567")).toBe("5551234567");
  });
});

describe("formatVIN", () => {
  it("uppercases and removes spaces", () => {
    expect(formatVIN("1hgb h55 41yl097890")).toBe("1HGBH5541YL097890");
  });

  it("truncates to 17 characters", () => {
    expect(formatVIN("1HGBH5541YL0978901234")).toBe("1HGBH5541YL097890");
  });
});

describe("formatLicensePlate", () => {
  it("uppercases and removes spaces", () => {
    expect(formatLicensePlate("abc 1234")).toBe("ABC1234");
  });
});

describe("isValidEmail", () => {
  it("accepts valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects missing @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects missing domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("formatCurrency", () => {
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats whole number", () => {
    expect(formatCurrency(1500)).toBe("$1,500");
  });

  it("rounds fractional to whole", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats large amounts with commas", () => {
    expect(formatCurrency(100000)).toBe("$100,000");
  });
});
