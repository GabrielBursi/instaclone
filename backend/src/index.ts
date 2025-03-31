import 'dotenv/config';
import fastify from "fastify";
import { CreateUserController, GetUserController, ListUsersCursorController } from './controllers/users';
import { CreatePostController, DeletePostController, ListPostsCursorController } from './controllers/posts';
import { FollowUserController, GetFollowersController, GetFollowingController, UnfollowUserController } from './controllers/followers';
import { GetPostLikesController, LikePostController, UnlikePostController } from './controllers/likes';

const app = fastify()

app.post('/users', CreateUserController.handler);
app.get('/users/:id', GetUserController.handler);
app.get('/users', ListUsersCursorController.handler);

app.get('/posts', ListPostsCursorController.handler);
app.post('/posts', CreatePostController.handler);
app.delete('/posts/:id', DeletePostController.handler);

app.get('/likes/:post_id', GetPostLikesController.handler);
app.post('/likes/like', LikePostController.handler);
app.post('/likes/unlike', UnlikePostController.handler);

app.get('/followers/:user_id', GetFollowersController.handler);
app.get('/followers/:user_id/following', GetFollowingController.handler);
app.post('/followers/follow', FollowUserController.handler);
app.post('/followers/unfollow', UnfollowUserController.handler);

app.listen({ port: 3333 })
	.then(() => console.log('> Server is running at http://localhost:3333'))
	.catch(console.log);
