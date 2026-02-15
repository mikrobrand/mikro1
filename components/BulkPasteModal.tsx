"use client";

import { useState } from "react";

interface BulkPasteModalProps {
  colorName: string;
  onApply: (sizes: { sizeLabel: string; stock: number }[]) => void;
  onClose: () => void;
}

export default function BulkPasteModal({
  colorName,
  onApply,
  onClose,
}: BulkPasteModalProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleApply = () => {
    setError("");
    const lines = input.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      setError("입력된 데이터가 없습니다");
      return;
    }

    const parsed: { sizeLabel: string; stock: number }[] = [];
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Support separators: whitespace, comma, tab
      const parts = line.split(/[\s,\t]+/);
      if (parts.length < 2) {
        errors.push(`라인 ${i + 1}: 사이즈와 재고를 입력해주세요`);
        continue;
      }

      const sizeLabel = parts[0].trim().toUpperCase().replace(/\s+/g, " ");
      const stockStr = parts[1].trim();
      const stock = parseInt(stockStr, 10);

      if (!sizeLabel) {
        errors.push(`라인 ${i + 1}: 사이즈명이 비어있습니다`);
        continue;
      }

      if (isNaN(stock) || stock < 0 || !Number.isInteger(Number(stockStr))) {
        errors.push(`라인 ${i + 1}: 재고는 0 이상 정수여야 합니다`);
        continue;
      }

      parsed.push({ sizeLabel, stock });
    }

    if (errors.length > 0) {
      setError(errors.join("\n"));
      return;
    }

    if (parsed.length === 0) {
      setError("유효한 데이터가 없습니다");
      return;
    }

    onApply(parsed);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-[20px] font-bold text-black mb-2">
          일괄 입력 - {colorName}
        </h2>
        <p className="text-[13px] text-gray-600 mb-4">
          사이즈와 재고를 입력하세요. 형식: 사이즈 재고 (예: S 10)
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`예시:\nS 10\nM 5\nL 0\nFREE 12\n\n또는 쉼표 구분:\nS,10\nM,5`}
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-mono placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors resize-none"
        />

        {error && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg">
            <p className="text-[13px] text-red-600 whitespace-pre-line">
              {error}
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 bg-gray-200 text-gray-700 rounded-xl text-[16px] font-bold active:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 h-12 bg-black text-white rounded-xl text-[16px] font-bold active:bg-gray-800 transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
