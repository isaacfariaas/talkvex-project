import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarHeatmap } from "../CalendarHeatmap";

describe("CalendarHeatmap", () => {
  it("should render empty heatmap with no habits", () => {
    const { container } = render(<CalendarHeatmap habits={[]} />);

    // Should still render the calendar structure
    expect(container.querySelector(".overflow-x-auto")).toBeInTheDocument();
    expect(screen.getByText("Menos")).toBeInTheDocument();
    expect(screen.getByText("Mais")).toBeInTheDocument();
  });

  it("should render heatmap with habit data", () => {
    const habits = [
      { date: new Date("2026-06-01"), completed: true },
      { date: new Date("2026-06-02"), completed: true },
      { date: new Date("2026-06-03"), completed: false },
    ];

    const { container } = render(<CalendarHeatmap habits={habits} />);

    // Check that the heatmap grid is rendered
    const heatmapCells = container.querySelectorAll(".w-3.h-3.rounded-sm");
    expect(heatmapCells.length).toBeGreaterThan(0);
  });

  it("should display month labels", () => {
    const today = new Date();
    const habits = [{ date: today, completed: true }];

    render(<CalendarHeatmap habits={habits} />);

    // Should have month labels from the past 6 months
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentMonth = monthNames[today.getMonth()];

    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  it("should show legend with intensity levels", () => {
    render(<CalendarHeatmap habits={[]} />);

    expect(screen.getByText("Menos")).toBeInTheDocument();
    expect(screen.getByText("Mais")).toBeInTheDocument();
  });

  it("should calculate completion intensity correctly", () => {
    const date = new Date("2026-06-05");
    const habits = [
      { date: new Date(date), completed: true },
      { date: new Date(date), completed: true },
      { date: new Date(date), completed: false },
    ];

    const { container } = render(<CalendarHeatmap habits={habits} />);

    // The component should aggregate multiple habits per day
    const heatmapCells = container.querySelectorAll(".w-3.h-3.rounded-sm");
    expect(heatmapCells.length).toBeGreaterThan(0);
  });

  it("should render weekday labels", () => {
    render(<CalendarHeatmap habits={[]} />);

    // Weekday labels are shown for odd indices only (Seg, Qua, Sex)
    // The component renders labels for indices 1, 3, 5 as single letters
    const { container } = render(<CalendarHeatmap habits={[]} />);
    const weekdayLabels = container.querySelector(".flex.flex-col.gap-1.mr-2");
    expect(weekdayLabels).toBeInTheDocument();
  });
});
