"use client";
import { useParams } from "next/navigation";

export default function ModelList() {
    const { model } = useParams();

    return <h1>{model}</h1>;
}