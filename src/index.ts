import {Hono} from "hono"
import { pingApi } from "./features/pingApi"

const app = new Hono()
app.route("/api", pingApi)

export default app