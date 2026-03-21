import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database/event.model";

export async function POST(req : NextRequest) {
    try{
        await connectToDatabase();

        let formData: FormData;
        try{
            formData = await req.formData();
        }
        catch(error){
            console.error('Malformed multipart request body:', error);
            return NextResponse.json({ message: 'Malformed request' }, { status: 400 });
        }

        let event;

        try{
            event = Object.fromEntries(formData.entries());
        }
        catch(error){
            console.error('Error parsing form data:', error);
            return NextResponse.json({ message: 'Invalid form data' }, { status: 400 });
        }

        const file = formData.get('image');

        if (!(file instanceof File)) {
            return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
        }
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ message: 'Only image uploads are supported' }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ message: 'Image must be 5MB or smaller' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: 'image',
                folder: 'DevNest',
            }, (error, result) => {
                if(error)reject(error);
                else if (!result?.secure_url || !result?.public_id) {
                    reject(new Error('Upload result missing required fields'));
                }
                else{
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                    });
                }
            }).end(buffer);
        });

        event.image = uploadResult.secure_url;
        const publicId = uploadResult.public_id;

        let createdEvent;
        try{
            createdEvent = await Event.create(event);
        }
        catch(error){
            if(publicId){
                try{
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
                }
                catch(cleanupError){
                    console.error('Error cleaning up uploaded image:', cleanupError);
                }
            }
            throw error;
        }

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    }
    catch(error){
        console.error('Error creating event:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req : NextRequest) {
    try{
        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    }
    catch(error){
        console.error('Error fetching events:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}