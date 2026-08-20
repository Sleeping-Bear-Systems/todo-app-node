import assert from "node:assert";
import test, { describe } from "node:test";
import { getInMemoryEventStore } from "@event-driven-io/emmett";
import { systemClock } from "./clock.ts";
import { mapToStreamId } from "./domain/userCommand.ts";
import { evolve, initialState } from "./domain/userState.ts";
import {
  adminUserId,
  createAdminUser,
  createStandardUser,
  createUser,
  defaultAdminPassword,
  defaultAdminUsername,
} from "./userHelper.ts";

describe("createUser", () => {
  test("creates a new user and stores events", async () => {
    const eventStore = getInMemoryEventStore();
    const userId = "test-user-123";
    const username = "TestUser";
    const password = "password123456";
    const role = "standard";

    const result = await createUser(
      userId,
      username,
      password,
      role,
      eventStore,
      systemClock,
    );

    assert.equal(result, userId);
    const streamName = mapToStreamId(userId);
    const { state } = await eventStore.aggregateStream(streamName, {
      evolve,
      initialState,
    });
    if (state.status === "Active") {
      assert.equal(state.userId, userId);
      assert.equal(state.username, "testuser");
      assert.equal(state.role, "standard");
    } else {
      assert.fail("Invalid status");
    }
  });

  test("normalizes username to lowercase and trims whitespace", async () => {
    const eventStore = getInMemoryEventStore();
    const userId = "test-user-456";
    const username = "  JohnDoe  ";
    const password = "password123456";

    await createUser(
      userId,
      username,
      password,
      "standard",
      eventStore,
      systemClock,
    );

    const streamName = mapToStreamId(userId);
    const { state } = await eventStore.aggregateStream(streamName, {
      evolve,
      initialState,
    });
    if (state.status === "Active") {
      assert.equal(state.username, "johndoe");
    } else {
      assert.fail("Invalid status");
    }
  });

  test("returns existing userId if stream already exists", async () => {
    const eventStore = getInMemoryEventStore();
    const userId = "existing-user";
    const password = "password123456";

    // Create user first time
    const firstResult = await createUser(
      userId,
      "existing",
      password,
      "standard",
      eventStore,
      systemClock,
    );
    assert.equal(firstResult, userId);

    // Try to create same user again
    const secondResult = await createUser(
      userId,
      "different-name",
      "different-password",
      "admin",
      eventStore,
      systemClock,
    );

    // Should return same userId without creating new events
    assert.equal(secondResult, userId);

    // Verify original state is unchanged
    const streamName = mapToStreamId(userId);
    const { state } = await eventStore.aggregateStream(streamName, {
      evolve,
      initialState,
    });
    if (state.status === "Active") {
      assert.equal(state.username, "existing");
      assert.equal(state.role, "standard");
    } else {
      assert.fail("Invalid status");
    }
  });

  test("creates admin user with valid role", async () => {
    const eventStore = getInMemoryEventStore();
    const userId = "admin-user-123";

    await createUser(
      userId,
      "admintest",
      "password123456",
      "admin",
      eventStore,
      systemClock,
    );

    const streamName = mapToStreamId(userId);
    const { state } = await eventStore.aggregateStream(streamName, {
      evolve,
      initialState,
    });
    if (state.status === "Active") {
      assert.equal(state.role, "admin");
    } else {
      assert.fail("Invalid status");
    }
  });
});

describe("createStandardUser", () => {
  test("creates standard user with predefined values", async () => {
    const eventStore = getInMemoryEventStore();
    const userId = await createStandardUser(eventStore, systemClock);
    const streamName = mapToStreamId(userId);
    const { state } = await eventStore.aggregateStream(streamName, {
      evolve,
      initialState,
    });
    if (state.status === "Active") {
      assert.equal(state.username, "john-doe");
      assert.equal(state.role, "standard");
      assert.equal(userId, "16822321-9ebc-4c2a-aa1f-e29a3ea8e295");
    } else {
      assert.fail("Invalid status");
    }
  });

  test("returns existing userId on second call", async () => {
    const eventStore = getInMemoryEventStore();
    const firstResult = await createStandardUser(eventStore, systemClock);
    const secondResult = await createStandardUser(eventStore, systemClock);

    assert.equal(firstResult, secondResult);
  });
});

describe("createAdminUser", () => {
  test("creates default admin user when isProduction is false", async () => {
    const eventStore = getInMemoryEventStore();
    const userId = await createAdminUser(false, {}, eventStore, systemClock);
    const streamName = mapToStreamId(userId);
    const { state } = await eventStore.aggregateStream(streamName, {
      evolve,
      initialState,
    });
    if (state.status === "Active") {
      assert.equal(state.userId, adminUserId);
      assert.equal(state.username, defaultAdminUsername);
      assert.equal(state.role, "admin");
    } else {
      assert.fail("Invalid status");
    }
  });

  test("creates admin user with custom credentials in production", async () => {
    const eventStore = getInMemoryEventStore();
    const processEnv = {
      ADMIN_USERNAME: "customadmin",
      ADMIN_PASSWORD: "CustomPassword123456",
    };

    const userId = await createAdminUser(
      true,
      processEnv,
      eventStore,
      systemClock,
    );

    const streamName = mapToStreamId(userId);
    const { state } = await eventStore.aggregateStream(streamName, {
      evolve,
      initialState,
    });
    if (state.status === "Active") {
      assert.equal(state.username, "customadmin");
      assert.equal(state.role, "admin");
    } else {
      assert.fail("Invalid status");
    }
  });

  test("throws error if ADMIN_USERNAME equals default in production", async () => {
    const eventStore = getInMemoryEventStore();
    const processEnv = {
      ADMIN_USERNAME: defaultAdminUsername,
      ADMIN_PASSWORD: "ValidPassword123456",
    };

    try {
      await createAdminUser(true, processEnv, eventStore, systemClock);
      assert.fail("Expected error to be thrown");
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.match((error as Error).message, /Invalid admin username/);
    }
  });

  test("throws error if ADMIN_PASSWORD equals default in production", async () => {
    const eventStore = getInMemoryEventStore();
    const processEnv = {
      ADMIN_USERNAME: "customadmin",
      ADMIN_PASSWORD: defaultAdminPassword,
    };

    try {
      await createAdminUser(true, processEnv, eventStore, systemClock);
      assert.fail("Expected error to be thrown");
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.match((error as Error).message, /Invalid admin password/);
    }
  });

  test("throws error if ADMIN_USERNAME is missing in production", async () => {
    const eventStore = getInMemoryEventStore();
    const processEnv = {
      ADMIN_PASSWORD: "ValidPassword123456",
    };

    try {
      await createAdminUser(true, processEnv, eventStore, systemClock);
      assert.fail("Expected error to be thrown");
    } catch (error) {
      assert.ok(error instanceof Error);
    }
  });

  test("throws error if ADMIN_PASSWORD is missing in production", async () => {
    const eventStore = getInMemoryEventStore();
    const processEnv = {
      ADMIN_USERNAME: "customadmin",
    };

    try {
      await createAdminUser(true, processEnv, eventStore, systemClock);
      assert.fail("Expected error to be thrown");
    } catch (error) {
      assert.ok(error instanceof Error);
    }
  });

  test("normalizes ADMIN_USERNAME to lowercase in production", async () => {
    const eventStore = getInMemoryEventStore();
    const processEnv = {
      ADMIN_USERNAME: "  CustomADMIN  ",
      ADMIN_PASSWORD: "ValidPassword123456",
    };

    const userId = await createAdminUser(
      true,
      processEnv,
      eventStore,
      systemClock,
    );

    const streamName = mapToStreamId(userId);
    const { state } = await eventStore.aggregateStream(streamName, {
      evolve,
      initialState,
    });
    if (state.status === "Active") {
      assert.equal(state.username, "customadmin");
    } else {
      assert.fail("Invalid status");
    }
  });

  test("returns existing userId on second call in production", async () => {
    const eventStore = getInMemoryEventStore();
    const processEnv = {
      ADMIN_USERNAME: "customadmin",
      ADMIN_PASSWORD: "ValidPassword123456",
    };

    const firstResult = await createAdminUser(
      true,
      processEnv,
      eventStore,
      systemClock,
    );
    const secondResult = await createAdminUser(
      true,
      processEnv,
      eventStore,
      systemClock,
    );

    assert.equal(firstResult, secondResult);
  });
});
