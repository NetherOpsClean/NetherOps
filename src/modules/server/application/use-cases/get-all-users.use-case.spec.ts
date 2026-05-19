import { GetAllUsersUseCase } from "./get-all-users.use-case";
import { InMemoryUserRepository } from "../../infrastructure/persistence/imp-test-user.repositry";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { PasswordHash } from "../../domain/value-objects/password-hash.vo";
import { UserRole } from "../../domain/value-objects/user-role.vo";

describe("GetAllUsersUseCase", () => {
  let useCase: GetAllUsersUseCase;
  let userRepository: InMemoryUserRepository;

  // Se ejecuta antes de cada test para asegurar un entorno limpio
  beforeEach(() => {
    // Instanciamos el repositorio dummy (empieza con arreglo vacío o sus semillas)
    userRepository = new InMemoryUserRepository();
    // Se lo pasamos al caso de uso
    useCase = new GetAllUsersUseCase(userRepository);
  });

  it("debe devolver un arreglo vacío si no hay usuarios", async () => {
    // 1. Ejecutar la acción si el repositorio está vacío
    // (Asegúrate de limpiar las semillas en el constructor del repo si quieres que empiece en cero)
    const users = await useCase.execute();

    // 2. Validar el resultado esperable
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBe(0);
  });

  it("debe devolver la lista con los usuarios creados", async () => {
    // 1. Preparar el escenario (Guardamos un usuario manualmente en el repo dummy)
    const newUser = User.create(
      new Email("alejandro@mail.com"),
      new PasswordHash("$2a$10$CwTycUXWue0Thq9StjUM0uBkh28a6zGZ8EDcAsJpTH0cWsM0.O5Ku"),
      UserRole.User
    );
    await userRepository.save(newUser);

    // 2. Actuar: Llamar al caso de uso
    const users = await useCase.execute();

    // 3. Afirmar (Assert): Verificar que el usuario guardado esté ahí
    expect(users.length).toBe(1);
    expect(users[0].getEmail().value).toBe("alejandro@mail.com");
  });
});
