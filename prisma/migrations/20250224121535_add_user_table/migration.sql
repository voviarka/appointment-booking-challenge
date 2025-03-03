CREATE TABLE "users"
(
    "id"       SERIAL       PRIMARY KEY NOT NULL,
    "name"     VARCHAR(250) NOT NULL,
    "email"    VARCHAR(250) NOT NULL UNIQUE,
    "language" VARCHAR(250) NOT NULL
);

insert into users (name, email, language) values ('Alice Joe', 'alice@email.com', 'English');
insert into users (name, email, language) values ('Tobias Joe', 'tobias@email.com', 'German');

