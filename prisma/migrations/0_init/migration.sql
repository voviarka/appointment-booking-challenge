CREATE TABLE "sales_managers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "languages" VARCHAR(100)[],
    "products" VARCHAR(100)[] ,
    "customer_ratings" VARCHAR(100)[],

    CONSTRAINT "sales_managers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "slots" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "booked" BOOLEAN NOT NULL DEFAULT false,
    "sales_manager_id" INTEGER NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "slots" ADD CONSTRAINT "slots_sales_manager_id_fkey" FOREIGN KEY ("sales_manager_id") REFERENCES "sales_managers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

