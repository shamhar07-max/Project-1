import { useCallback, useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const ROLES = ["learner", "reviewer", "verifier", "admin"];

export default function AdminUsersPage() {
  const { user: self } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const data = await api.adminUsers();
    setUsers(data.users);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleChange(user, role) {
    if (role === user.role) return;
    setBusyId(user.id);
    try {
      await api.adminSetRole(user.id, role);
      await load();
      toast(`${user.name} is now ${role}.`);
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyId(null);
    }
  }

  if (!users) return null;

  return (
    <section className="card rounded-2xl bg-white p-6">
      <h1 className="serif text-3xl font-semibold">Users &amp; Roles</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Role is never self-service — it can only be changed here, by an admin, for someone else's account. You
        cannot change your own role, to avoid an accidental lockout.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase text-muted">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="py-2 pr-4">{u.name}</td>
                <td className="py-2 pr-4 text-muted">{u.email}</td>
                <td className="py-2">
                  <select
                    className="field"
                    style={{ width: "auto" }}
                    value={u.role}
                    disabled={u.id === self.id || busyId === u.id}
                    onChange={(e) => handleChange(u, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {u.id === self.id && <span className="ml-2 text-xs text-muted">(you)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
