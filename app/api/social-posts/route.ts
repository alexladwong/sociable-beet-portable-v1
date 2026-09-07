import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Input=z.object({
 workspaceId:z.string().min(1),
 body:z.string().min(10),
 type:z.enum(["INSPIRATION","DEVOTIONAL","LEADERSHIP","ENCOURAGEMENT","PRODUCTIVITY","ANNOUNCEMENT"]).default("INSPIRATION"),
 status:z.enum(["DRAFT","SCHEDULED","PUBLISHED","FAILED"]).default("DRAFT"),
 channels:z.array(z.string()).default([]),
 hashtags:z.array(z.string()).default([]),
 mediaUrl:z.string().url().optional(),
 scheduledAt:z.string().datetime().optional()
});

export async function GET(){
 return NextResponse.json(await prisma.socialPost.findMany({orderBy:{createdAt:"desc"},take:50}));
}
export async function POST(req:Request){
 const parsed=Input.safeParse(await req.json());
 if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
 const p=parsed.data;
 const post=await prisma.socialPost.create({data:{...p,scheduledAt:p.scheduledAt?new Date(p.scheduledAt):undefined}});
 return NextResponse.json(post,{status:201});
}
