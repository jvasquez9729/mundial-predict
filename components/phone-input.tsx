"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone } from "lucide-react";

interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

const countries: CountryCode[] = [
  { code: "CO", dialCode: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "US", dialCode: "+1", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "MX", dialCode: "+52", name: "México", flag: "🇲🇽" },
  { code: "AR", dialCode: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "BR", dialCode: "+55", name: "Brasil", flag: "🇧🇷" },
  { code: "CL", dialCode: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "PE", dialCode: "+51", name: "Perú", flag: "🇵🇪" },
  { code: "EC", dialCode: "+593", name: "Ecuador", flag: "🇪🇨" },
  { code: "VE", dialCode: "+58", name: "Venezuela", flag: "🇻🇪" },
  { code: "UY", dialCode: "+598", name: "Uruguay", flag: "🇺🇾" },
  { code: "PY", dialCode: "+595", name: "Paraguay", flag: "🇵🇾" },
  { code: "BO", dialCode: "+591", name: "Bolivia", flag: "🇧🇴" },
  { code: "PA", dialCode: "+507", name: "Panamá", flag: "🇵🇦" },
  { code: "CR", dialCode: "+506", name: "Costa Rica", flag: "🇨🇷" },
  { code: "GT", dialCode: "+502", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", dialCode: "+504", name: "Honduras", flag: "🇭🇳" },
  { code: "NI", dialCode: "+505", name: "Nicaragua", flag: "🇳🇮" },
  { code: "SV", dialCode: "+503", name: "El Salvador", flag: "🇸🇻" },
  { code: "DO", dialCode: "+1", name: "República Dominicana", flag: "🇩🇴" },
  { code: "CU", dialCode: "+53", name: "Cuba", flag: "🇨🇺" },
  { code: "ES", dialCode: "+34", name: "España", flag: "🇪🇸" },
  { code: "CA", dialCode: "+1", name: "Canadá", flag: "🇨🇦" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  required?: boolean;
  id?: string;
  className?: string;
  placeholder?: string;
}

export function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  required = false,
  id = "celular",
  className = "",
  placeholder = "3001234567",
}: PhoneInputProps) {
  const selectedCountry = countries.find((c) => c.dialCode === countryCode) || countries[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    onChange(numericValue);
  };

  return (
    <div className="flex gap-2">
      <Select value={countryCode} onValueChange={onCountryCodeChange}>
        <SelectTrigger className="w-[140px] bg-input border-border">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.dialCode}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.dialCode}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span className="text-sm">{country.dialCode}</span>
                <span className="text-xs text-muted-foreground ml-2">{country.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative flex-1">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type="tel"
          placeholder={placeholder}
          value={value}
          onChange={handlePhoneChange}
          required={required}
          minLength={7}
          maxLength={15}
          className={`pl-10 bg-input border-border ${className}`}
        />
      </div>
    </div>
  );
}
