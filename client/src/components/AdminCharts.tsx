"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#34d399", "#f472b6", "#60a5fa", "#fb923c"];

const cardStyle = {
  background: "rgb(var(--surface))",
  borderColor: "rgb(var(--surface2))",
};

type TopPost = { name: string; views: number };
type CatItem = { name: string; value: number };

export function TopPostsChart({ data }: { data: TopPost[] }) {
  if (!data.length) {
    return (
      <div
        className="flex h-48 items-center justify-center text-sm"
        style={{ color: "rgb(var(--t3))" }}
      >
        Henüz görüntülenme verisi yok.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "rgb(var(--t3))" }} />
        <YAxis tick={{ fontSize: 10, fill: "rgb(var(--t3))" }} />
        <Tooltip
          contentStyle={{
            background: "rgb(var(--surface))",
            border: "1px solid rgb(var(--surface2))",
            borderRadius: "12px",
            color: "rgb(var(--t1))",
          }}
          cursor={{ fill: "rgba(99,102,241,0.08)" }}
        />
        <Bar dataKey="views" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }: { data: CatItem[] }) {
  if (!data.length) {
    return (
      <div
        className="flex h-40 items-center justify-center text-sm"
        style={{ color: "rgb(var(--t3))" }}
      >
        Yazı yok.
      </div>
    );
  }
  return (
    <>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={72}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--surface2))",
              borderRadius: "12px",
              color: "rgb(var(--t1))",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span style={{ color: "rgb(var(--t2))" }}>{d.name}</span>
            <span
              className="ml-auto font-bold"
              style={{ color: "rgb(var(--t1))" }}
            >
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AdminCharts({
  topPostsData,
  categoryData,
}: {
  topPostsData: TopPost[];
  categoryData: CatItem[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border p-5" style={cardStyle}>
        <div
          className="mb-4 text-sm font-bold"
          style={{ color: "rgb(var(--t1))" }}
        >
          En Çok Okunan Yazılar
        </div>
        <TopPostsChart data={topPostsData} />
      </div>
      <div className="rounded-2xl border p-5" style={cardStyle}>
        <div
          className="mb-4 text-sm font-bold"
          style={{ color: "rgb(var(--t1))" }}
        >
          Kategori Dağılımı
        </div>
        <CategoryPieChart data={categoryData} />
      </div>
    </div>
  );
}
