import { Server } from "./server.entity.js";
import { IdFactory, UserId, NodeId, TemplateId } from "../value-objects/id.vo.js";
import { MemoryLimit } from "../value-objects/memory-limit.vo.js";
import { ServerConfiguration } from "../value-objects/server-configuration.vo.js";
import { Difficulty, GameMode } from "../value-objects/configuration.enum.js";

const makeServer = (
  overrides?: Partial<{
    name: string;
    memoryLimitMb: number;
    diskLimitMb: number;
    port: number;
  }>
): Server => {
  return Server.create(
    overrides?.name ?? "test-server",
    IdFactory.generate<UserId>(),
    IdFactory.generate<NodeId>(),
    IdFactory.generate<TemplateId>(),
    MemoryLimit.create(overrides?.memoryLimitMb ?? 2048),
    overrides?.port ?? 25565,
    ServerConfiguration.create(20, GameMode.SURVIVAL, Difficulty.NORMAL, true, "Test Server", false)
  );
};

describe("Server entity", () => {
  describe("create()", () => {
    it("should create a server with OFFLINE status", () => {
      const server = makeServer();
      expect(server.isOffline()).toBe(true);
    });

    it("should generate a unique id", () => {
      const a = makeServer();
      const b = makeServer();
      expect(a.getId().toString()).not.toBe(b.getId().toString());
    });

    it("should store the provided name", () => {
      const server = makeServer({ name: "my-server" });
      expect(server.getName()).toBe("my-server");
    });

    it("should store the provided port", () => {
      const server = makeServer({ port: 25566 });
      expect(server.getPort()).toBe(25566);
    });

    it("should store the provided memory limit", () => {
      const server = makeServer({ memoryLimitMb: 4096 });
      expect(server.getMemoryMb()).toBe(4096);
    });
  });

  // ─── reconstitute ─────────────────────────────────────────────────────────

  describe("reconstitute()", () => {
    it("should restore a server with the given status", () => {
      const server = Server.reconstitute(
        "some-id",
        "restored-server",
        IdFactory.generate<UserId>(),
        IdFactory.generate<NodeId>(),
        IdFactory.generate<TemplateId>(),
        MemoryLimit.create(2048),
        "RUNNING",
        25565,
        ServerConfiguration.create(20, GameMode.SURVIVAL, Difficulty.NORMAL, true, "Test", false),
        new Date()
      );
      expect(server.isRunning()).toBe(true);
      expect(server.getId().toString()).toBe("some-id");
    });
  });

  // ─── start ────────────────────────────────────────────────────────────────

  describe("start()", () => {
    it("should transition from OFFLINE to STARTING", () => {
      const server = makeServer();
      server.start();
      expect(server.isStarting()).toBe(true);
    });

    it("should throw if server is already STARTING", () => {
      const server = makeServer();
      server.start();
      expect(() => server.start()).toThrow("Server is already running or starting");
    });

    it("should throw if server is already RUNNING", () => {
      const server = makeServer();
      server.start();
      server.markAsRunning();
      expect(() => server.start()).toThrow("Server is already running or starting");
    });

    it("should throw if server is SUSPENDED", () => {
      const server = makeServer();
      server.markAsSuspended();
      expect(() => server.start()).toThrow("Cannot start server");
    });
  });

  // ─── markAsRunning ────────────────────────────────────────────────────────

  describe("markAsRunning()", () => {
    it("should transition from STARTING to RUNNING", () => {
      const server = makeServer();
      server.start();
      server.markAsRunning();
      expect(server.isRunning()).toBe(true);
    });

    it("should throw if server is not STARTING", () => {
      const server = makeServer();
      expect(() => server.markAsRunning()).toThrow("Server must be STARTING to mark as running");
    });
  });

  // ─── stop ─────────────────────────────────────────────────────────────────

  describe("stop()", () => {
    it("should transition from RUNNING to STOPPING", () => {
      const server = makeServer();
      server.start();
      server.markAsRunning();
      server.stop();
      expect(server.isStopping()).toBe(true);
    });

    it("should throw if server is OFFLINE", () => {
      const server = makeServer();
      expect(() => server.stop()).toThrow("Server is already out of service");
    });

    it("should throw if server is already STOPPING", () => {
      const server = makeServer();
      server.start();
      server.markAsRunning();
      server.stop();
      expect(() => server.stop()).toThrow("Server is already out of service");
    });

    it("should throw if server is SUSPENDED", () => {
      const server = makeServer();
      server.markAsSuspended();
      expect(() => server.stop()).toThrow("Server is already out of service");
    });
  });

  // ─── markAsOffline ────────────────────────────────────────────────────────

  describe("markAsOffline()", () => {
    it("should transition from STOPPING to OFFLINE", () => {
      const server = makeServer();
      server.start();
      server.markAsRunning();
      server.stop();
      server.markAsOffline();
      expect(server.getStatus()).toBe("OFFLINE");
    });

    it("should throw if server is not STOPPING", () => {
      const server = makeServer();
      expect(() => server.markAsOffline()).toThrow("Server must be STOPPING to mark as offline");
    });
  });

  // ─── changeMemoryLimit ────────────────────────────────────────────────────

  describe("changeMemoryLimit()", () => {
    it("should update memory limit when server is OFFLINE", () => {
      const server = makeServer({ memoryLimitMb: 2048 });
      server.changeMemoryLimit(MemoryLimit.create(4096));
      expect(server.getMemoryMb()).toBe(4096);
    });

    it("should throw if server is RUNNING", () => {
      const server = makeServer();
      server.start();
      server.markAsRunning();
      expect(() => server.changeMemoryLimit(MemoryLimit.create(4096))).toThrow(
        "Cannot change memory limit while server is running"
      );
    });
  });

  // ─── changeConfiguration ──────────────────────────────────────────────────

  describe("changeConfiguration()", () => {
    it("should update configuration when server is OFFLINE", () => {
      const server = makeServer();
      const newConfig = ServerConfiguration.create(
        50,
        GameMode.CREATIVE,
        Difficulty.EASY,
        false,
        "New MOTD",
        true
      );
      server.changeConfiguration(newConfig);
      expect(server.getConfiguration().maxPlayers).toBe(50);
      expect(server.getConfiguration().gameMode).toBe(GameMode.CREATIVE);
    });

    it("should throw if server is RUNNING", () => {
      const server = makeServer();
      server.start();
      server.markAsRunning();
      const newConfig = ServerConfiguration.create(
        50,
        GameMode.CREATIVE,
        Difficulty.EASY,
        false,
        "New MOTD",
        true
      );
      expect(() => server.changeConfiguration(newConfig)).toThrow(
        "Cannot change configuration while server is running"
      );
    });
  });

  // ─── isActive ─────────────────────────────────────────────────────────────

  describe("isActive()", () => {
    it("should return true when RUNNING", () => {
      const server = makeServer();
      server.start();
      server.markAsRunning();
      expect(server.isActive()).toBe(true);
    });

    it("should return true when STARTING", () => {
      const server = makeServer();
      server.start();
      expect(server.isActive()).toBe(true);
    });

    it("should return false when OFFLINE", () => {
      const server = makeServer();
      expect(server.isActive()).toBe(false);
    });

    it("should return false when SUSPENDED", () => {
      const server = makeServer();
      server.markAsSuspended();
      expect(server.isActive()).toBe(false);
    });
  });

  // ─── assignPort ───────────────────────────────────────────────────────────

  describe("assignPort()", () => {
    it("should update the allocated port", () => {
      const server = makeServer({ port: 25565 });
      server.assignPort(25566);
      expect(server.getPort()).toBe(25566);
    });
  });
});
