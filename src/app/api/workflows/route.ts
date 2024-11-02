import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch workflows
export async function GET(req: NextRequest) {
  try {
    const userClerk = await currentUser();

    if (!userClerk || !userClerk.id) {
      return NextResponse.json({ msg: "User is not authenticated" }, { status: 401 });
    }

    const workflows = await db.workflows.findMany({
      where: {
        userId: userClerk.id,
      }
    });

    return NextResponse.json({ workflows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
  }
}

// POST: Create workflow
export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    const userClerk = await currentUser();

    if (!userClerk || !userClerk.id) {
      return NextResponse.json({ msg: "User is not authenticated" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: {
        clerkId: userClerk.id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }

    const workflow = await db.workflows.create({
      data: {
        name,
        description,
        userId: userClerk.id,
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove workflow
export async function DELETE(req: NextRequest) {
  try {
    const userClerk = await currentUser();
    if (!userClerk || !userClerk.id) {
      return NextResponse.json({ msg: "User is not authenticated" }, { status: 401 });
    }

    const { workflowId } = await req.json();

    if (!workflowId) {
      return NextResponse.json({ msg: "Workflow ID is required" }, { status: 400 });
    }

    const workflow = await db.workflows.delete({
      where: {
        id: workflowId,
        userId: userClerk.id,
      },
    });

    return NextResponse.json({ msg: "Workflow deleted", workflow }, { status: 200 });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update workflow
// export async function PATCH(req: NextRequest) {
//   try {
//     const userClerk = await currentUser();

//     if (!userClerk || !userClerk.id) {
//       return NextResponse.json({ msg: "User is not authenticated" }, { status: 401 });
//     }

//     const { workflowId, isEnabled } = await req.json();

//     if (!workflowId || typeof isEnabled !== 'boolean') {
//       return NextResponse.json({ msg: "Workflow ID and valid isEnabled status are required" }, { status: 400 });
//     }

//     const workflow = await db.workflows.update({
//       where: {
//         id: workflowId,
//         userId: userClerk.id,
//       },
//       data: {
//         isEnabled,
//       },
//     });

//     return NextResponse.json({ msg: "Workflow updated", workflow }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating workflow:", error);
//     return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
//   }
// }

// Optional configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;