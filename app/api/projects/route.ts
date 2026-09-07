import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Input=z.object({workspaceId:z.string().min(1),name:z.string().min(2),description:z.string().optional()});

export async function GET(){
 return NextResponse.json(await prisma.project.findMany({include:{tasks:true},orderBy:{createdAt:"desc"}}));
}
export async function POST(req:Request){
 const parsed=Input.safeParse(await req.json());
 if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
 return NextResponse.json(await prisma.project.create({data:parsed.data}),{status:201});
}
