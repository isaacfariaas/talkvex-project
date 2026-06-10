import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HabitsList } from "../HabitsList";

describe("HabitsList", () => {
  it("should render empty state when no habits", () => {
    render(<HabitsList habits={[]} />);

    expect(screen.getByText(/Você ainda não tem hábitos ativos/i)).toBeInTheDocument();
    expect(screen.getByText(/Hábitos são gerados automaticamente/i)).toBeInTheDocument();
  });

  it("should render habits list with data", () => {
    const habits = [
      {
        title: "Exercício diário",
        frequency: "daily" as const,
        current: 5,
        best: 10,
        completionRate: 80,
      },
      {
        title: "Meditação",
        frequency: "weekdays" as const,
        current: 3,
        best: 7,
        completionRate: 60,
      },
    ];

    render(<HabitsList habits={habits} />);

    expect(screen.getByText("Exercício diário")).toBeInTheDocument();
    expect(screen.getByText("Meditação")).toBeInTheDocument();
    expect(screen.getByText("Diário")).toBeInTheDocument();
    expect(screen.getByText("Dias úteis")).toBeInTheDocument();
  });

  it("should display completion rates", () => {
    const habits = [
      {
        title: "Test Habit",
        frequency: "daily" as const,
        current: 2,
        best: 5,
        completionRate: 75,
      },
    ];

    render(<HabitsList habits={habits} />);

    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("should display current and best streaks", () => {
    const habits = [
      {
        title: "Test Habit",
        frequency: "daily" as const,
        current: 5,
        best: 10,
        completionRate: 80,
      },
    ];

    render(<HabitsList habits={habits} />);

    expect(screen.getByText("5 dias")).toBeInTheDocument();
    expect(screen.getByText("10 dias")).toBeInTheDocument();
  });

  it("should handle custom frequency label", () => {
    const habits = [
      {
        title: "Custom Habit",
        frequency: "custom" as const,
        current: 1,
        best: 2,
        completionRate: 50,
      },
    ];

    render(<HabitsList habits={habits} />);

    expect(screen.getByText("Personalizado")).toBeInTheDocument();
  });

  it("should render multiple habits", () => {
    const habits = [
      {
        title: "Habit 1",
        frequency: "daily" as const,
        current: 1,
        best: 2,
        completionRate: 50,
      },
      {
        title: "Habit 2",
        frequency: "weekdays" as const,
        current: 3,
        best: 5,
        completionRate: 60,
      },
      {
        title: "Habit 3",
        frequency: "custom" as const,
        current: 2,
        best: 4,
        completionRate: 70,
      },
    ];

    render(<HabitsList habits={habits} />);

    expect(screen.getByText("Habit 1")).toBeInTheDocument();
    expect(screen.getByText("Habit 2")).toBeInTheDocument();
    expect(screen.getByText("Habit 3")).toBeInTheDocument();
  });
});
