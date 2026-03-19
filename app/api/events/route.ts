import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database/event.model";
export async function POST(req : NextRequest) {
    try{
        await connectToDatabase();

        const formData = await req.formData();

        let event;

        try{
            event = Object.fromEntries(formData.entries());
        }
        catch(error){
            console.error('Error parsing form data:', error);
            return NextResponse.json({ message: 'Invalid form data', error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 400 });
        }

        const createdEvent = await Event.create(event);
        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    }
    catch(error){
        console.error('Error creating event:', error);
        return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
    }
}