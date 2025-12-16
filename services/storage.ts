import { AppState } from "../types";
import { apiService } from "./api";

export const loadState = async (): Promise<AppState> => {
  try {
    const [expenses, goals] = await Promise.all([
      apiService.getExpenses(),
      apiService.getGoals()
    ]);
    return { expenses, goals };
  } catch (error) {
    console.error("Error loading state from API:", error);
    // Throw so callers can handle the failure explicitly
    throw error;
  }
};

export const saveState = async (_state: AppState): Promise<void> => {
  return;
};