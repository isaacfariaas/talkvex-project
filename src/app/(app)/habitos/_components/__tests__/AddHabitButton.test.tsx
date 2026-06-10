import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddHabitButton } from "../AddHabitButton";

describe("AddHabitButton", () => {
  it("should render button with correct text", () => {
    render(<AddHabitButton />);

    expect(screen.getByText("Adicionar Hábito")).toBeInTheDocument();
  });

  it("should show alert when clicked", () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<AddHabitButton />);

    const button = screen.getByText("Adicionar Hábito");
    fireEvent.click(button);

    expect(alertMock).toHaveBeenCalledWith(
      expect.stringContaining("Funcionalidade de adicionar hábito manual em desenvolvimento")
    );

    alertMock.mockRestore();
  });

  it("should have proper button structure", () => {
    render(<AddHabitButton />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("inline-flex");
  });
});
