import fakerEn from "faker/locale/en";
import fakerEnUS from "faker/locale/en_US";

import { generateCompanies } from "./companies";
import { generateContactNotes } from "./contactNotes";
import { generateContacts } from "./contacts";
import { generateDealNotes } from "./dealNotes";
import { generateDeals } from "./deals";
import { finalize } from "./finalize";
import { generateSales } from "./sales";
import { generateTags } from "./tags";
import { generateTasks } from "./tasks";
import type { Db } from "./types";

// Accessibility-corpus integration (P14): a fixed seed makes the demo data
// identical on every load; journeys also fix the clock, because some values
// are relative to the current date.
const DEMO_SEED = 20261004;

export default (): Db => {
  fakerEnUS.seed(DEMO_SEED);
  fakerEn.seed(DEMO_SEED);
  const db = {} as Db;
  db.sales = generateSales(db);
  db.tags = generateTags(db);
  db.companies = generateCompanies(db);
  db.contacts = generateContacts(db);
  db.contact_notes = generateContactNotes(db);
  db.deals = generateDeals(db);
  db.deal_notes = generateDealNotes(db);
  db.tasks = generateTasks(db);
  db.configuration = [
    {
      id: 1,
      config: {} as Db["configuration"][number]["config"],
    },
  ];
  finalize(db);

  return db;
};
