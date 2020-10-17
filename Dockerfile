FROM node:14.13.1

WORKDIR /usr/src/bet-me

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]
