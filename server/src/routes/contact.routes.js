import express from "express";
import { bulkDeleteContacts, createContact, deleteContact, getContacts, getContactById } from "../controllers/contacts.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const contactRouter = express.Router();


contactRouter.get("/get-contacts", verifyUser, getContacts);
contactRouter.get("/get-contact/:id", verifyUser, getContactById);
contactRouter.post("/create-contact", verifyUser, createContact);
contactRouter.delete("/delete-contact/:id", verifyUser, deleteContact);
contactRouter.post("/bulk-delete", verifyUser, bulkDeleteContacts);

export default contactRouter;