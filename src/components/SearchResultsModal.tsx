// components/SearchResultsModal.tsx
import React from 'react';
import { Dialog } from '@headlessui/react'; // or use your own modal
import { ProcessedQuestion } from '../types/user';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  results: ProcessedQuestion[];
  onSelect: (question: ProcessedQuestion) => void;
}

const SearchResultsModal = ({ isOpen, onClose, results, onSelect }: Props) => (
  <Dialog open={isOpen} onClose={onClose} className="relative z-50">
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl space-y-4 overflow-y-auto max-h-[80vh]">
        <Dialog.Title className="text-xl font-bold">Search Results</Dialog.Title>
        {results.length === 0 ? (
          <p className="text-gray-500">No matches found.</p>
        ) : (
          <ul className="space-y-2">
            {results.map((q, i) => (
              <li key={i} className="border p-3 rounded cursor-pointer hover:bg-slate-100" onClick={() => onSelect(q)}>
                <p className="text-sm text-slate-500">PrepTest {q.preptest}, Section {q.section}, Q{q.question}</p>
                <p className="font-medium">{q.question.slice(0, 150)}{q.question.length > 150 && '...'}</p>
              </li>
            ))}
          </ul>
        )}
      </Dialog.Panel>
    </div>
  </Dialog>
);

export default SearchResultsModal;
