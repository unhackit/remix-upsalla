import type { Note } from "@prisma/client";

import { db } from "~/utils/db.server";

export type { Note } from "@prisma/client";

export function getNote() {
    return db.note.findMany({
        orderBy: { updatedAt: "desc" },
    });
}

export function getNoteListItems() {
    return db.note.findMany({
        orderBy: { updatedAt: "desc" },
    });
}

export function createNote({ body }: Pick<Note, "body">) {
    return db.note.create({
        data: {
            body,
        },
    });
}

export function deleteNote({ id }: Pick<Note, "id">) {
    return db.note.deleteMany({
        where: { id },
    });
}
