import { useEffect, useState } from "react";
import api from "../api/api";

export default function CreateGroup({ onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/search?query=")
      .then(res => setUsers(res.data));
  }, []);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const create = async () => {
    if (!name) {
      setError("Group name required");
      return;
    }
    if (selected.length < 2) {
      setError("Select at least 2 users");
      return;
    }

    const res = await api.post("/conversations/group", {
      name,
      participantIds: selected,
      groupImageUrl: null
    });

    onCreated(res.data);
    onClose();
  };

  return (
    <div className="p-3 border-b bg-gray-50">
      <h3 className="font-semibold mb-2">Create Group</h3>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        className="w-full border p-2 mb-2"
        placeholder="Group name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <div className="max-h-40 overflow-y-auto border p-2 mb-2">
        {users.map(u => (
          <label key={u.id} className="block text-sm">
            <input
              type="checkbox"
              onChange={() => toggle(u.id)}
            />{" "}
            {u.email}
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={create}
          className="bg-blue-600 text-white px-3 py-1"
        >
          Create
        </button>
        <button
          onClick={onClose}
          className="border px-3 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
