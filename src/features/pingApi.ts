import { Hono } from "hono";

export const pingApi = new Hono().get("/ping", (c)=>{
    return c.json({ ok: true });
})