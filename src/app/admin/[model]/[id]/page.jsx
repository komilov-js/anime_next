"use client";
import { useParams } from "next/navigation";

export default function ModelList() {
    const { model, id } = useParams();

    return (
        <>
            <h1>{model}</h1>
            <h2>{id}</h2>
        </>
    )

}