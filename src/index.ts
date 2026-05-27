import {Hono} from "hono"
import { pingApi } from "./features/pingApi"

const app = new Hono()
.route("/api", pingApi)

export default app