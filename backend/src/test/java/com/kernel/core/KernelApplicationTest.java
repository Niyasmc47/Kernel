package com.kernel.core;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class KernelApplicationTest {
    @Test
    void mainClassExists() {
        assertNotNull(KernelApplication.class);
    }
}

