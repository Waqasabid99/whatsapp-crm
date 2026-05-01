import { prisma } from "../db.js";

// Get all contacts
const getContacts = async (req, res) => {
    try {
        const { workspaceId } = req.user;

        const contacts = await prisma.contact.findMany({
            where: {
                workspaceId,
            },
        });

        res.status(200).json({ success: true, message: "Contacts fetched successfully", contacts });
        console.log(contacts)
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
        console.log(error)
    }
}

// Get single contact by Id
const getContactById = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { id } = req.params;

        const contact = await prisma.contact.findUnique({
            where: {
                id,
                workspaceId,
            },
        });

        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }

        res.status(200).json({ success: true, message: "Contact fetched successfully", contact });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
        console.log(error);
    }
}

// Create contact
const createContact = async (req, res) => {
    try {
        const { workspaceId } = req.user;
        const { name, phone, metadata } = req.body;

        const contact = await prisma.contact.create({
            data: {
                name,
                phoneNumber: phone,
                metadata,
                workspaceId,
            },
        });

        res.status(200).json({ success: true, message: "Contact created successfully", contact });
        console.log(contact)

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
        console.log(error)
    }
}

// Delete contact
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await prisma.contact.delete({
            where: {
                id,
            },
        });

        res.status(200).json({ success: true, message: "Contact deleted successfully", contact });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });  
    }
}

// Bulk Delete 
const bulkDeleteContacts = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No contacts selected for deletion"
      });
    }

    const deleted = await prisma.contact.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return res.status(200).json({
      success: true,
      message: `${deleted.count} contacts deleted successfully`,
      deletedCount: deleted.count
    });

  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getContacts, getContactById, createContact, deleteContact, bulkDeleteContacts }