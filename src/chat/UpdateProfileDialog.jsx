import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress
} from "@mui/material";

import api from "../api/api";

export default function UpdateProfileDialog({ open, onClose }) {
  const [name, setName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!open) return;

    api.get("/users/me").then(res => {
      setName(res.data.name || "");
      setProfileImageUrl(res.data.profileImageUrl || "");
      setIsAdmin(res.data.role === "ADMIN"); // ✅ admin check
    });
  }, [open]);

  const uploadImage = async (file) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/chat/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setProfileImageUrl(res.data.url);
    setUploading(false);
  };

  const save = async () => {
    setLoading(true);
    await api.put("/users/me", {
      name,
      profileImageUrl,
    });
    setLoading(false);
    onClose(true);
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Update Profile</DialogTitle>

      <DialogContent className="flex flex-col items-center gap-4">

        <Avatar src={profileImageUrl} sx={{ width: 80, height: 80 }} />

        <Button variant="outlined" component="label" disabled={uploading}>
          {uploading ? "Uploading..." : "Change Photo"}
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={e => uploadImage(e.target.files[0])}
          />
        </Button>

        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        {/* ✅ ADMIN SECTION */}
        {isAdmin && (
          <div className="w-full mt-6 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Admin tools</p>

            <Link
              to="/admin"
              className="block w-full text-center py-2 rounded
                         bg-red-600 text-white text-sm
                         hover:bg-red-700 transition"
            >
              Open Admin Panel
            </Link>
          </div>
        )}

      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={save} disabled={loading} variant="contained">
          {loading ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
