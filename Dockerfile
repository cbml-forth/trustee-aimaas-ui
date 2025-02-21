FROM denoland/deno:alpine-2.2.1

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY . .
RUN deno cache main.ts

EXPOSE 8000

CMD ["run", "-A", "--unstable-kv", "main.ts"]
