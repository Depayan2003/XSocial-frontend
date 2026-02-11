import { useState } from "react";
import api from "../api/api";

export default function UserSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  const search = async () => {
    const res = await api.get(`/users/search?query=${query}`);
    setUsers(res.data);
  };

  return (
    <div className="px-4 py-3 bg-gray-900">
      <input
        className="
          w-full
          bg-gray-800
          text-gray-200
          placeholder-gray-500
          px-3
          py-2
          text-sm
          rounded-md
          outline-none
          focus:ring-1
          focus:ring-gray-700
        "
        placeholder="Search users"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyUp={search}
      />

      <div className="mt-2">
        {users.map(user => (
          <div
            key={user.id}
            onClick={() => onSelect(user)}
            className="
              px-3
              py-2
              text-sm
              text-gray-300
              hover:bg-gray-800
              cursor-pointer
              rounded-md
            "
          >
            {user.email || user.name}
          </div>
        ))}
      </div>
    </div>
  );
}
