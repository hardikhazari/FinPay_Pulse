-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `clerkId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'viewer',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_clerkId_key`(`clerkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `signupDate` DATETIME(3) NULL,
    `region` VARCHAR(191) NULL,

    UNIQUE INDEX `Customer_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `transactionDate` DATETIME(3) NOT NULL,
    `productCategory` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,

    INDEX `Transaction_customerId_status_idx`(`customerId`, `status`),
    INDEX `Transaction_transactionDate_idx`(`transactionDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RfmScore` (
    `customerId` VARCHAR(191) NOT NULL,
    `recencyScore` INTEGER NOT NULL,
    `frequencyScore` INTEGER NOT NULL,
    `monetaryScore` INTEGER NOT NULL,
    `segment` VARCHAR(191) NOT NULL,
    `computedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RfmScore_computedAt_idx`(`computedAt`),
    PRIMARY KEY (`customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cohort` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `cohortMonth` VARCHAR(191) NOT NULL,
    `activeMonth` VARCHAR(191) NOT NULL,
    `retained` BOOLEAN NOT NULL,
    `computedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Cohort_cohortMonth_idx`(`cohortMonth`),
    INDEX `Cohort_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Clv` (
    `customerId` VARCHAR(191) NOT NULL,
    `predictedClv` DECIMAL(10, 2) NOT NULL,
    `computedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Clv_computedAt_idx`(`computedAt`),
    PRIMARY KEY (`customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChurnScore` (
    `customerId` VARCHAR(191) NOT NULL,
    `churnProbability` DOUBLE NOT NULL,
    `riskTier` VARCHAR(191) NOT NULL,
    `computedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChurnScore_computedAt_idx`(`computedAt`),
    INDEX `ChurnScore_riskTier_idx`(`riskTier`),
    PRIMARY KEY (`customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Forecast` (
    `month` VARCHAR(191) NOT NULL,
    `predictedRevenue` DECIMAL(10, 2) NOT NULL,
    `modelUsed` VARCHAR(191) NOT NULL,
    `computedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`month`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
