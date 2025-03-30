import 'dotenv/config';
import fastify from "fastify";

const app = fastify()

app.get("/", (_req, res) => {
	res.send({ hello: 'world' })
})

app.listen({ port: 3333 }).then(v => console.log(v))
