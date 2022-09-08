import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    console.log(request.session.userId);
    return request.currentUser;
  },
);

// context is kinda a wrapper around incoming request.
// the reason it refers as an Execution context as supposed to just simply request,
// because ExecutionContext object can be used to kinda abstract a websocket incoming message, a gRPC request, http request and graphql and lot of other kind of incoming request.
