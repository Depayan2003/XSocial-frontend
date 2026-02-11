import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button
} from "@mui/material";
import api from "../api/api";

export default function GroupInfoDialog({
  open,
  onClose,
  group,
  currentUserId,
  isAdmin,
  refresh
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{group.name}</DialogTitle>

      <DialogContent className="flex flex-col gap-3">

        {/* 👥 Participants */}
        {group.participants
          ?.filter(p => !p.deleted)
          .map(p => (
            <div
              key={p.user.id}
              className="flex justify-between items-center"
            >
              <span className="text-sm text-gray-800">
                {p.user.email}
                {p.admin && " (admin)"}
              </span>

              {isAdmin && p.user.id !== currentUserId && (
                <Button
                  size="small"
                  color="error"
                  onClick={async () => {
                    await api.delete(
                      `/conversations/groups/${group.id}/participants/${p.user.id}`
                    );
                    refresh();
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}

        {/* 🚪 Leave group */}
        <Button
          color="warning"
          onClick={async () => {
            await api.post(`/conversations/groups/${group.id}/leave`);
            onClose();
            refresh();
          }}
        >
          Leave Group
        </Button>

        {/* 🗑 Delete group */}
        {isAdmin && (
          <Button
            color="error"
            onClick={async () => {
              await api.delete(`/conversations/groups/${group.id}`);
              onClose();
              refresh();
            }}
          >
            Delete Group
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
