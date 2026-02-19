import { authGuardPlugin, requirePermission } from "@backend/middlewares/auth.ts";
import { ProgramStudiService } from "@backend/services/database_models/programStudi.service.ts";
import { Elysia, t } from "elysia";

export default new Elysia()
	// Public endpoints for dropdown data (no auth required)
	.get(
		"/all",
		async () => {
			return await ProgramStudiService.getAll();
		},
	)
	.get(
		"/by-departemen/:departemenId",
		async ({ params: { departemenId } }) => {
			return await ProgramStudiService.getByDepartemen(departemenId);
		},
	)
	// Protected endpoints below (if any)
	.use(authGuardPlugin);
