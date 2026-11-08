import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// GET /api/admin/stats — dashboard statistics
export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      pendingOrders,
      paidOrders,
      recentOrdersAgg,
      lowStockProducts,
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.customer.count(),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.count({ where: { paymentStatus: "PAID" } }),
      db.order.aggregate({ _sum: { total: true } }),
      db.productSize.findMany({
        where: { stock: { lte: 3 } },
        include: { product: { select: { nameAr: true, slug: true } } },
        take: 10,
      }),
    ]);

    // Sales last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOrders = await db.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { total: true, createdAt: true, paymentStatus: true },
      orderBy: { createdAt: "asc" },
    });

    const dailySales: { date: string; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStr = day.toISOString().slice(0, 10);
      const dayOrders = recentOrders.filter(
        (o) => o.createdAt.toISOString().slice(0, 10) === dayStr
      );
      dailySales.push({
        date: dayStr,
        total: dayOrders.reduce((s, o) => s + (o.paymentStatus === "PAID" ? o.total : 0), 0),
        count: dayOrders.length,
      });
    }

    // Top selling products
    const topProducts = await db.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        pendingOrders,
        paidOrders,
        totalRevenue: recentOrdersAgg._sum.total ?? 0,
        dailySales,
        topProducts: topProducts.map((p) => ({
          name: p.productName,
          quantity: p._sum.quantity ?? 0,
          orders: p._count,
        })),
        lowStock: lowStockProducts.map((s) => ({
          product: s.product.nameAr,
          size: s.size,
          stock: s.stock,
        })),
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Stats failed" },
      { status: 500 }
    );
  }
}
