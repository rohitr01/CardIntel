"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "cardintel_compare_slugs";
export const MAX_COMPARE_CARDS = 5;

export interface CompareContextType {
  selectedCardSlugs: string[];
  addCard: (slug: string) => { success: boolean; error?: string };
  removeCard: (slug: string) => void;
  toggleCard: (slug: string) => { success: boolean; error?: string };
  clearCompare: () => void;
  isInCompare: (slug: string) => boolean;
  setCards: (slugs: string[]) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedCardSlugs, setSelectedCardSlugs] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedCardSlugs(parsed.slice(0, MAX_COMPARE_CARDS));
        }
      }
    } catch (e) {
      console.warn("Could not load compare list from localStorage:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCardSlugs));
    } catch (e) {
      console.warn("Could not save compare list to localStorage:", e);
    }
  }, [selectedCardSlugs, isInitialized]);

  const addCard = (slug: string) => {
    if (!slug) return { success: false, error: "Invalid card" };
    if (selectedCardSlugs.includes(slug)) {
      return { success: true };
    }
    if (selectedCardSlugs.length >= MAX_COMPARE_CARDS) {
      return {
        success: false,
        error: `You can compare up to ${MAX_COMPARE_CARDS} cards at a time. Remove a card to add this one.`,
      };
    }
    setSelectedCardSlugs((prev) => [...prev, slug]);
    return { success: true };
  };

  const removeCard = (slug: string) => {
    setSelectedCardSlugs((prev) => prev.filter((s) => s !== slug));
  };

  const toggleCard = (slug: string) => {
    if (selectedCardSlugs.includes(slug)) {
      removeCard(slug);
      return { success: true };
    }
    return addCard(slug);
  };

  const clearCompare = () => {
    setSelectedCardSlugs([]);
  };

  const isInCompare = (slug: string) => {
    return selectedCardSlugs.includes(slug);
  };

  const setCards = (slugs: string[]) => {
    const valid = Array.from(new Set(slugs.filter(Boolean))).slice(0, MAX_COMPARE_CARDS);
    setSelectedCardSlugs(valid);
  };

  return (
    <CompareContext.Provider
      value={{
        selectedCardSlugs,
        addCard,
        removeCard,
        toggleCard,
        clearCompare,
        isInCompare,
        setCards,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
