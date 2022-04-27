import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { ActionFunction, json, LoaderFunction, redirect, useLoaderData, useTransition } from "remix";
import { createNote, deleteNote, getNoteListItems } from "~/models/note.server";
import type { Note } from "~/models/note.server";

type ActionData = {
    errors?: {
        body?: string;
    };
};

type LoaderData = Note[];

export const loader: LoaderFunction = async () => {
    const note = await getNoteListItems();
    if (!note) {
        throw new Response("Not Found", { status: 404 });
    }
    return json(note);
};

export const action: ActionFunction = async ({ request }: { request: any }) => {
    const formData = await request.formData();
    let { _action, ...values } = Object.fromEntries(formData);
    if (_action === "create") {
        const body = formData.get("body");

        if (typeof body !== "string" || body.length === 0) {
            return json<ActionData>({ errors: { body: "Body is required" } }, { status: 400 });
        }

        const note = await createNote({ body });

        return redirect(`/notes`);
    }

    if (_action === "delete") {
        console.log("here", values);
        await deleteNote({ id: values.id });

        return redirect("/notes");
    }
};

export default function NewNotePage() {
    const actionData = useActionData() as ActionData;
    const data = useLoaderData() as LoaderData;
    const bodyRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="w-9/12 my-20 mx-auto text-center flex justify-center items-center gap-10">
            <div className="flex-grow">{data && data.map((note) => <NoteComponent note={note} />)}</div>
            <div className="flex-grow">
                <Form method="post">
                    <div>
                        <label className="flex w-full flex-col gap-1 mt-4">
                            <span>Note: </span>
                            <input
                                ref={bodyRef}
                                name="body"
                                className="w-2/4 mx-auto flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
                                aria-invalid={actionData?.errors?.body ? true : undefined}
                                aria-errormessage={actionData?.errors?.body ? "body-error" : undefined}
                            />
                        </label>
                        {actionData?.errors?.body && (
                            <div className="pt-1 text-red-700" id="body-error">
                                {actionData.errors.body}
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            name="_action"
                            value="create"
                            className="rounded my-3 bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                        >
                            Save
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

const NoteComponent = ({ note }: { note: Note }) => {
    const transition = useTransition();

    return (
        <div>
            <p className="py-2">{note.body}</p>
            <Form method="post">
                <input type="hidden" name="id" value={note.id} />
                <button
                    name="_action"
                    value="delete"
                    type="submit"
                    style={{
                        opacity: transition.submission?.formData.get("id") === note.id ? 0.25 : 1,
                    }}
                    className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                >
                    Delete
                </button>
            </Form>
        </div>
    );
};
