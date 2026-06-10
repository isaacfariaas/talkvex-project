"use client";

interface HabitDay {
  date: Date;
  completed: boolean;
}

function getWeekdayLabel(day: number) {
  const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return labels[day];
}

function getMonthLabel(month: number) {
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return labels[month];
}

export function CalendarHeatmap({ habits }: { habits: HabitDay[] }) {
  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // Create a map of dates to completion counts
  const dateMap = new Map<string, { total: number; completed: number }>();
  habits.forEach((h) => {
    const dateKey = h.date.toISOString().split("T")[0];
    const existing = dateMap.get(dateKey) || { total: 0, completed: 0 };
    dateMap.set(dateKey, {
      total: existing.total + 1,
      completed: existing.completed + (h.completed ? 1 : 0),
    });
  });

  // Generate all days in the range
  const days: Array<{ date: Date; intensity: number }> = [];
  const currentDate = new Date(sixMonthsAgo);

  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split("T")[0];
    const stats = dateMap.get(dateKey);
    const intensity = stats ? (stats.completed / stats.total) * 100 : 0;
    days.push({
      date: new Date(currentDate),
      intensity,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Group by weeks
  const weeks: Array<Array<{ date: Date; intensity: number }>> = [];
  let currentWeek: Array<{ date: Date; intensity: number }> = [];

  // Pad the start to align with Sunday
  const firstDay = days[0].date.getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: new Date(0), intensity: -1 }); // -1 = empty cell
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (day.date.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: new Date(0), intensity: -1 });
    }
    weeks.push(currentWeek);
  }

  function getColor(intensity: number) {
    if (intensity < 0) return "transparent";
    if (intensity === 0) return "hsl(var(--border))";
    if (intensity < 30) return "hsl(var(--success) / 0.3)";
    if (intensity < 60) return "hsl(var(--success) / 0.5)";
    if (intensity < 90) return "hsl(var(--success) / 0.7)";
    return "hsl(var(--success))";
  }

  // Get unique months for labels
  const monthLabels: Array<{ month: string; offset: number }> = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find((d) => d.intensity >= 0);
    if (firstValidDay && firstValidDay.date.getMonth() !== lastMonth) {
      monthLabels.push({
        month: getMonthLabel(firstValidDay.date.getMonth()),
        offset: weekIndex,
      });
      lastMonth = firstValidDay.date.getMonth();
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-2" style={{ marginLeft: "24px" }}>
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="text-xs font-medium"
              style={{
                color: "hsl(var(--muted-foreground))",
                marginLeft: i === 0 ? 0 : `${(m.offset - (monthLabels[i - 1]?.offset || 0)) * 14}px`,
              }}
            >
              {m.month}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1">
          {/* Weekday labels */}
          <div className="flex flex-col gap-1 mr-2">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <div
                key={day}
                className="text-xs h-3 flex items-center"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {day % 2 === 1 ? getWeekdayLabel(day).slice(0, 1) : ""}
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-3 h-3 rounded-sm transition-colors"
                    style={{
                      backgroundColor: getColor(day.intensity),
                      border: day.intensity >= 0 ? "1px solid hsl(var(--border) / 0.3)" : "none",
                    }}
                    title={
                      day.intensity >= 0
                        ? `${day.date.toLocaleDateString("pt-BR")}: ${Math.round(day.intensity)}%`
                        : ""
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          <span>Menos</span>
          <div className="flex gap-1">
            {[0, 30, 60, 90, 100].map((intensity) => (
              <div
                key={intensity}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getColor(intensity) }}
              />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </div>
    </div>
  );
}
