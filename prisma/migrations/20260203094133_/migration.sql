/*
  Warnings:

  - You are about to drop the `ReviewType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `challenges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rating_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `submissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_challenges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CoderStatus" AS ENUM ('A', 'I', 'U');

-- CreateEnum
CREATE TYPE "CoderType" AS ENUM ('PROFESSIONAL', 'STUDENT');

-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('SINGLE_ROUND_MATCH', 'TOURNAMENT_ROUND', 'MARATHON_MATCH', 'PRACTICE_ROUND', 'LONG_ROUND', 'AMD_ROUND', 'WEAKEST_LINK_ROUND', 'MODERATED_CHAT', 'PRIVATE_LABEL_TOURNAMENT', 'TEAM_SINGLE_ROUND_MATCH', 'TEAM_TOURNAMENT_ROUND', 'LONG_PROBLEM_ROUND', 'LONG_PROBLEM_TOURNAMENT_ROUND', 'INTEL_ROUND', 'HIGH_SCHOOL_SRM', 'EDUCATION_SRM');

-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'USED', 'PROPOSED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('COMPETITION', 'REGISTRATION', 'ANNOUNCEMENT', 'MARATHON', 'SRM');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('NORMAL', 'SCHOOL', 'COMPANY', 'ALGORITHM');

-- CreateEnum
CREATE TYPE "SkillStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS', 'PUSH');

-- DropForeignKey
ALTER TABLE "rating_history" DROP CONSTRAINT "rating_history_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "rating_history" DROP CONSTRAINT "rating_history_userId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_challenges" DROP CONSTRAINT "user_challenges_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "user_challenges" DROP CONSTRAINT "user_challenges_userId_fkey";

-- DropTable
DROP TABLE "ReviewType";

-- DropTable
DROP TABLE "challenges";

-- DropTable
DROP TABLE "rating_history";

-- DropTable
DROP TABLE "submissions";

-- DropTable
DROP TABLE "user_challenges";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "handle" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(64),
    "last_name" VARCHAR(64),
    "middle_name" VARCHAR(64),
    "email" VARCHAR(100),
    "status" "CoderStatus" NOT NULL DEFAULT 'A',
    "activation_code" VARCHAR(32),
    "member_since" TIMESTAMP(3),
    "last_site_hit_date" TIMESTAMP(3),
    "reg_source" VARCHAR(50),
    "utm_source" VARCHAR(50),
    "utm_medium" VARCHAR(50),
    "utm_campaign" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coder" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "state_code" VARCHAR(10),
    "country_code" VARCHAR(10),
    "comp_country_code" VARCHAR(10),
    "address1" VARCHAR(254),
    "address2" VARCHAR(254),
    "city" VARCHAR(64),
    "zip" VARCHAR(16),
    "quote" TEXT,
    "language_id" INTEGER,
    "coder_type_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "coder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "state" (
    "state_code" VARCHAR(10) NOT NULL,
    "state_name" VARCHAR(64) NOT NULL,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "state_pkey" PRIMARY KEY ("state_code")
);

-- CreateTable
CREATE TABLE "country" (
    "country_code" VARCHAR(10) NOT NULL,
    "country_name" VARCHAR(64) NOT NULL,
    "participating" INTEGER DEFAULT 0,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "country_pkey" PRIMARY KEY ("country_code")
);

-- CreateTable
CREATE TABLE "algo_rating" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "vol" INTEGER NOT NULL DEFAULT 0,
    "num_ratings" INTEGER NOT NULL DEFAULT 0,
    "algo_rating_type_id" INTEGER NOT NULL,
    "highest_rating" INTEGER,
    "lowest_rating" INTEGER,
    "first_rated_round_id" INTEGER,
    "last_rated_round_id" INTEGER,
    "num_competitions" INTEGER DEFAULT 0,
    "round_id" INTEGER,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "algo_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "algo_rating_type" (
    "id" SERIAL NOT NULL,
    "algo_rating_type_desc" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "algo_rating_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "algo_rating_history" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "round_id" INTEGER NOT NULL,
    "algo_rating_type_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "vol" INTEGER NOT NULL DEFAULT 0,
    "num_ratings" INTEGER NOT NULL DEFAULT 0,
    "num_competitions" INTEGER DEFAULT 0,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "algo_rating_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coder_rank" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "coder_rank_type_id" INTEGER NOT NULL,
    "algo_rating_type_id" INTEGER NOT NULL,
    "percentile" DECIMAL(7,4),
    "rank" INTEGER,
    "rank_no_tie" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "coder_rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coder_rank_type" (
    "id" SERIAL NOT NULL,
    "coder_rank_type_desc" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "coder_rank_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coder_rank_history" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "round_id" INTEGER NOT NULL,
    "coder_rank_type_id" INTEGER NOT NULL,
    "algo_rating_type_id" INTEGER NOT NULL,
    "percentile" DECIMAL(7,4),
    "rank" INTEGER,
    "rank_no_tie" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "coder_rank_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_coder_rank" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "country_code" VARCHAR(10) NOT NULL,
    "algo_rating_type_id" INTEGER NOT NULL,
    "percentile" DECIMAL(7,4),
    "rank" INTEGER,
    "rank_no_tie" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "country_coder_rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "state_coder_rank" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "state_code" VARCHAR(10) NOT NULL,
    "algo_rating_type_id" INTEGER NOT NULL,
    "percentile" DECIMAL(7,4),
    "rank" INTEGER,
    "rank_no_tie" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "state_coder_rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_coder_rank" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "algo_rating_type_id" INTEGER NOT NULL,
    "percentile" DECIMAL(7,4),
    "rank" INTEGER,
    "rank_no_tie" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "school_coder_rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" VARCHAR(1),
    "group_id" INTEGER,
    "ad_text" TEXT,
    "ad_start" TIMESTAMP(3),
    "ad_end" TIMESTAMP(3),
    "ad_task" VARCHAR(30),
    "ad_command" VARCHAR(30),
    "activate_menu" INTEGER,
    "season_id" INTEGER,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER,
    "name" VARCHAR(128),
    "status" VARCHAR(1),
    "registration_limit" INTEGER,
    "invitational" INTEGER DEFAULT 0,
    "round_type_id" INTEGER,
    "short_name" VARCHAR(64),
    "forum_id" INTEGER,
    "rated_ind" INTEGER DEFAULT 1,
    "region_id" INTEGER,
    "tc_direct_project_id" INTEGER,
    "calendar_id" INTEGER,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round_type_lu" (
    "id" SERIAL NOT NULL,
    "round_type_desc" VARCHAR(64) NOT NULL,
    "algo_rating_type_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "round_type_lu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "name" VARCHAR(64),
    "division_id" INTEGER,
    "room_no" INTEGER,
    "room_type_id" INTEGER,
    "eligible" INTEGER DEFAULT 0,
    "admin_room" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_result" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "point_total" DECIMAL(14,2),
    "room_seed" INTEGER,
    "paid" DECIMAL(10,2),
    "old_rating" INTEGER,
    "new_rating" INTEGER,
    "old_vol" INTEGER,
    "new_vol" INTEGER,
    "room_placed" INTEGER,
    "attended" VARCHAR(1),
    "advanced" VARCHAR(1),
    "overall_rank" INTEGER,
    "division_seed" INTEGER,
    "division_placed" INTEGER,
    "rated_flag" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "room_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "long_comp_result" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "placed" INTEGER,
    "point_total" DECIMAL(14,2),
    "system_point_total" DECIMAL(14,2),
    "old_rating" INTEGER,
    "new_rating" INTEGER,
    "old_vol" INTEGER,
    "new_vol" INTEGER,
    "attended" VARCHAR(1),
    "advanced" VARCHAR(1),
    "rated" INTEGER DEFAULT 0,
    "num_submissions" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "long_comp_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128),
    "status_id" INTEGER,
    "problem_text" TEXT,
    "problem_type_id" INTEGER,
    "proposed_difficulty_id" INTEGER,
    "proposed_division_id" INTEGER,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_status_lu" (
    "id" SERIAL NOT NULL,
    "problem_status_desc" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "problem_status_lu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_category_xref" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "problem_category_xref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER,
    "result_type_id" INTEGER,
    "method_name" VARCHAR(64),
    "class_name" VARCHAR(64),
    "default_solution" TEXT,
    "component_type_id" INTEGER,
    "component_text" TEXT,
    "status_id" INTEGER,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round_component" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "component_id" INTEGER NOT NULL,
    "submit_order" INTEGER,
    "division_id" INTEGER,
    "difficulty_id" INTEGER,
    "points" DECIMAL(10,2),
    "open_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "round_component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "difficulty" (
    "id" SERIAL NOT NULL,
    "difficulty_desc" VARCHAR(64) NOT NULL,
    "difficulty_level" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "difficulty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_type" (
    "id" SERIAL NOT NULL,
    "data_type_desc" VARCHAR(64) NOT NULL,
    "language" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "data_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "long_problem_submission" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "component_id" INTEGER NOT NULL,
    "submission_number" INTEGER NOT NULL,
    "submission_text" TEXT,
    "open_time" TIMESTAMP(3),
    "submit_time" TIMESTAMP(3),
    "submission_points" DECIMAL(14,2),
    "language_id" INTEGER,
    "example" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "long_problem_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "long_submission" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "component_id" INTEGER NOT NULL,
    "submission_number" INTEGER NOT NULL,
    "submission_text" TEXT,
    "submit_time" TIMESTAMP(3),
    "language_id" INTEGER,
    "example" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "long_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "long_component_state" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "component_id" INTEGER NOT NULL,
    "points" DECIMAL(14,2),
    "status_id" INTEGER,
    "submission_number" INTEGER,
    "example_submission_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "long_component_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "long_compilation" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "component_id" INTEGER NOT NULL,
    "submission_number" INTEGER NOT NULL,
    "open_time" TIMESTAMP(3),
    "compile_time" TIMESTAMP(3),
    "compile_status" INTEGER,
    "language_id" INTEGER,
    "compilation_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "long_compilation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_test_case" (
    "id" SERIAL NOT NULL,
    "component_id" INTEGER NOT NULL,
    "test_case_id" INTEGER NOT NULL,
    "args" TEXT,
    "expected_result" TEXT,
    "modify_date" TIMESTAMP(3),
    "example" INTEGER DEFAULT 0,
    "system_flag" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "system_test_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "long_system_test_result" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "component_id" INTEGER NOT NULL,
    "test_case_id" INTEGER NOT NULL,
    "submission_number" INTEGER NOT NULL,
    "test_action" VARCHAR(10),
    "received_value" TEXT,
    "score" DECIMAL(14,2),
    "processing_time" INTEGER,
    "fatal" INTEGER DEFAULT 0,
    "timestamp" TIMESTAMP(3),
    "viewable" INTEGER DEFAULT 0,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "long_system_test_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_type_lu" (
    "skill_type_id" SERIAL NOT NULL,
    "skill_type_desc" VARCHAR(64) NOT NULL,
    "skill_type_order" INTEGER,
    "status" VARCHAR(1),
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "skill_type_lu_pkey" PRIMARY KEY ("skill_type_id")
);

-- CreateTable
CREATE TABLE "skill" (
    "skill_id" SERIAL NOT NULL,
    "skill_type_id" INTEGER NOT NULL,
    "skill_desc" VARCHAR(64) NOT NULL,
    "status" VARCHAR(1),
    "skill_order" INTEGER,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "skill_pkey" PRIMARY KEY ("skill_id")
);

-- CreateTable
CREATE TABLE "coder_skill_xref" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "skill_type_id" INTEGER,
    "ranking" INTEGER,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "coder_skill_xref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school" (
    "school_id" SERIAL NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "short_name" VARCHAR(64),
    "sort_letter" VARCHAR(1),
    "city" VARCHAR(64),
    "state_code" VARCHAR(10),
    "country_code" VARCHAR(10),
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "school_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "current_school" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "gpa" DECIMAL(5,2),
    "gpa_scale" DECIMAL(5,2),
    "viewable" INTEGER DEFAULT 1,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "current_school_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "team_id" SERIAL NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "team_type" INTEGER,
    "school_id" INTEGER,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "team_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "team_coder_xref" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "team_coder_xref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_group_xref" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "create_date" TIMESTAMP(3),
    "security_status_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "user_group_xref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "image_id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "image_type_id" INTEGER NOT NULL,
    "path_id" INTEGER,
    "link" VARCHAR(255),
    "height" INTEGER,
    "width" INTEGER,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "image_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "path" (
    "path_id" SERIAL NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "path_pkey" PRIMARY KEY ("path_id")
);

-- CreateTable
CREATE TABLE "coder_image_xref" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "image_id" INTEGER NOT NULL,
    "display_flag" INTEGER DEFAULT 1,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "coder_image_xref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievement" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "achievement_type_id" INTEGER NOT NULL,
    "achievement_date" TIMESTAMP(3),
    "description" VARCHAR(255),
    "achievement_type_desc" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "user_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_type_lu" (
    "achievement_type_id" SERIAL NOT NULL,
    "achievement_type_desc" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "achievement_type_lu_pkey" PRIMARY KEY ("achievement_type_id")
);

-- CreateTable
CREATE TABLE "streak" (
    "id" SERIAL NOT NULL,
    "coder_id" INTEGER NOT NULL,
    "streak_type_id" INTEGER NOT NULL,
    "start_round_id" INTEGER,
    "end_round_id" INTEGER,
    "length" INTEGER,
    "is_active" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "event_id" SERIAL NOT NULL,
    "event_type_id" INTEGER NOT NULL,
    "event_type_desc" VARCHAR(64),
    "event_desc" VARCHAR(255),
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "event_type_lu" (
    "event_type_id" SERIAL NOT NULL,
    "event_type_desc" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "event_type_lu_pkey" PRIMARY KEY ("event_type_id")
);

-- CreateTable
CREATE TABLE "event_registration" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "eligible_ind" INTEGER,
    "notes" TEXT,
    "modify_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "event_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "notify_id" INTEGER NOT NULL,
    "name" VARCHAR(64),
    "status" VARCHAR(1),
    "notify_type_id" INTEGER,
    "notify_type_desc" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "user_notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar" (
    "calendar_id" SERIAL NOT NULL,
    "year" INTEGER,
    "month_numeric" INTEGER,
    "month_alpha_long" VARCHAR(20),
    "month_alpha_short" VARCHAR(10),
    "day_of_month" INTEGER,
    "day_of_week_numeric" INTEGER,
    "day_of_week_alpha_long" VARCHAR(20),
    "day_of_week_alpha_short" VARCHAR(10),
    "day_of_year" INTEGER,
    "week_of_year" INTEGER,
    "quarter" INTEGER,
    "date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "calendar_pkey" PRIMARY KEY ("calendar_id")
);

-- CreateTable
CREATE TABLE "time" (
    "time_id" SERIAL NOT NULL,
    "hour" INTEGER,
    "minute" INTEGER,
    "meridiem" VARCHAR(2),
    "hour_minute" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "time_pkey" PRIMARY KEY ("time_id")
);

-- CreateTable
CREATE TABLE "update_log" (
    "log_id" SERIAL NOT NULL,
    "calendar_id" INTEGER,
    "timestamp" TIMESTAMP(3),
    "log_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(64),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" VARCHAR(64),

    CONSTRAINT "update_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_handle_key" ON "user"("handle");

-- CreateIndex
CREATE INDEX "user_handle_idx" ON "user"("handle");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE UNIQUE INDEX "coder_user_id_key" ON "coder"("user_id");

-- CreateIndex
CREATE INDEX "coder_user_id_idx" ON "coder"("user_id");

-- CreateIndex
CREATE INDEX "coder_country_code_idx" ON "coder"("country_code");

-- CreateIndex
CREATE INDEX "coder_state_code_idx" ON "coder"("state_code");

-- CreateIndex
CREATE INDEX "coder_coder_type_id_idx" ON "coder"("coder_type_id");

-- CreateIndex
CREATE INDEX "algo_rating_coder_id_idx" ON "algo_rating"("coder_id");

-- CreateIndex
CREATE INDEX "algo_rating_algo_rating_type_id_idx" ON "algo_rating"("algo_rating_type_id");

-- CreateIndex
CREATE INDEX "algo_rating_rating_idx" ON "algo_rating"("rating");

-- CreateIndex
CREATE INDEX "algo_rating_modify_date_idx" ON "algo_rating"("modify_date");

-- CreateIndex
CREATE UNIQUE INDEX "algo_rating_coder_id_algo_rating_type_id_key" ON "algo_rating"("coder_id", "algo_rating_type_id");

-- CreateIndex
CREATE INDEX "algo_rating_history_coder_id_idx" ON "algo_rating_history"("coder_id");

-- CreateIndex
CREATE INDEX "algo_rating_history_round_id_idx" ON "algo_rating_history"("round_id");

-- CreateIndex
CREATE INDEX "algo_rating_history_algo_rating_type_id_idx" ON "algo_rating_history"("algo_rating_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "algo_rating_history_coder_id_round_id_algo_rating_type_id_key" ON "algo_rating_history"("coder_id", "round_id", "algo_rating_type_id");

-- CreateIndex
CREATE INDEX "coder_rank_coder_id_idx" ON "coder_rank"("coder_id");

-- CreateIndex
CREATE INDEX "coder_rank_rank_idx" ON "coder_rank"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "coder_rank_coder_id_coder_rank_type_id_algo_rating_type_id_key" ON "coder_rank"("coder_id", "coder_rank_type_id", "algo_rating_type_id");

-- CreateIndex
CREATE INDEX "coder_rank_history_coder_id_idx" ON "coder_rank_history"("coder_id");

-- CreateIndex
CREATE INDEX "coder_rank_history_round_id_idx" ON "coder_rank_history"("round_id");

-- CreateIndex
CREATE UNIQUE INDEX "coder_rank_history_coder_id_round_id_coder_rank_type_id_alg_key" ON "coder_rank_history"("coder_id", "round_id", "coder_rank_type_id", "algo_rating_type_id");

-- CreateIndex
CREATE INDEX "country_coder_rank_country_code_idx" ON "country_coder_rank"("country_code");

-- CreateIndex
CREATE INDEX "country_coder_rank_rank_idx" ON "country_coder_rank"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "country_coder_rank_coder_id_country_code_algo_rating_type_i_key" ON "country_coder_rank"("coder_id", "country_code", "algo_rating_type_id");

-- CreateIndex
CREATE INDEX "state_coder_rank_state_code_idx" ON "state_coder_rank"("state_code");

-- CreateIndex
CREATE INDEX "state_coder_rank_rank_idx" ON "state_coder_rank"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "state_coder_rank_coder_id_state_code_algo_rating_type_id_key" ON "state_coder_rank"("coder_id", "state_code", "algo_rating_type_id");

-- CreateIndex
CREATE INDEX "school_coder_rank_school_id_idx" ON "school_coder_rank"("school_id");

-- CreateIndex
CREATE INDEX "school_coder_rank_rank_idx" ON "school_coder_rank"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "school_coder_rank_coder_id_school_id_algo_rating_type_id_key" ON "school_coder_rank"("coder_id", "school_id", "algo_rating_type_id");

-- CreateIndex
CREATE INDEX "contest_name_idx" ON "contest"("name");

-- CreateIndex
CREATE INDEX "contest_start_date_idx" ON "contest"("start_date");

-- CreateIndex
CREATE INDEX "round_contest_id_idx" ON "round"("contest_id");

-- CreateIndex
CREATE INDEX "round_round_type_id_idx" ON "round"("round_type_id");

-- CreateIndex
CREATE INDEX "round_calendar_id_idx" ON "round"("calendar_id");

-- CreateIndex
CREATE INDEX "room_round_id_idx" ON "room"("round_id");

-- CreateIndex
CREATE INDEX "room_division_id_idx" ON "room"("division_id");

-- CreateIndex
CREATE INDEX "room_result_round_id_idx" ON "room_result"("round_id");

-- CreateIndex
CREATE INDEX "room_result_room_id_idx" ON "room_result"("room_id");

-- CreateIndex
CREATE INDEX "room_result_coder_id_idx" ON "room_result"("coder_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_result_round_id_coder_id_key" ON "room_result"("round_id", "coder_id");

-- CreateIndex
CREATE INDEX "long_comp_result_round_id_idx" ON "long_comp_result"("round_id");

-- CreateIndex
CREATE INDEX "long_comp_result_coder_id_idx" ON "long_comp_result"("coder_id");

-- CreateIndex
CREATE UNIQUE INDEX "long_comp_result_round_id_coder_id_key" ON "long_comp_result"("round_id", "coder_id");

-- CreateIndex
CREATE INDEX "problem_status_id_idx" ON "problem"("status_id");

-- CreateIndex
CREATE INDEX "problem_category_xref_problem_id_idx" ON "problem_category_xref"("problem_id");

-- CreateIndex
CREATE INDEX "problem_category_xref_category_id_idx" ON "problem_category_xref"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_category_xref_problem_id_category_id_key" ON "problem_category_xref"("problem_id", "category_id");

-- CreateIndex
CREATE INDEX "component_problem_id_idx" ON "component"("problem_id");

-- CreateIndex
CREATE INDEX "round_component_round_id_idx" ON "round_component"("round_id");

-- CreateIndex
CREATE INDEX "round_component_component_id_idx" ON "round_component"("component_id");

-- CreateIndex
CREATE UNIQUE INDEX "round_component_round_id_component_id_division_id_key" ON "round_component"("round_id", "component_id", "division_id");

-- CreateIndex
CREATE INDEX "long_problem_submission_round_id_idx" ON "long_problem_submission"("round_id");

-- CreateIndex
CREATE INDEX "long_problem_submission_coder_id_idx" ON "long_problem_submission"("coder_id");

-- CreateIndex
CREATE UNIQUE INDEX "long_problem_submission_round_id_coder_id_component_id_subm_key" ON "long_problem_submission"("round_id", "coder_id", "component_id", "submission_number", "example");

-- CreateIndex
CREATE INDEX "long_submission_round_id_idx" ON "long_submission"("round_id");

-- CreateIndex
CREATE INDEX "long_submission_coder_id_idx" ON "long_submission"("coder_id");

-- CreateIndex
CREATE UNIQUE INDEX "long_submission_round_id_coder_id_component_id_submission_n_key" ON "long_submission"("round_id", "coder_id", "component_id", "submission_number", "example");

-- CreateIndex
CREATE INDEX "long_component_state_round_id_idx" ON "long_component_state"("round_id");

-- CreateIndex
CREATE INDEX "long_component_state_coder_id_idx" ON "long_component_state"("coder_id");

-- CreateIndex
CREATE UNIQUE INDEX "long_component_state_round_id_coder_id_component_id_key" ON "long_component_state"("round_id", "coder_id", "component_id");

-- CreateIndex
CREATE INDEX "long_compilation_round_id_idx" ON "long_compilation"("round_id");

-- CreateIndex
CREATE INDEX "long_compilation_coder_id_idx" ON "long_compilation"("coder_id");

-- CreateIndex
CREATE UNIQUE INDEX "long_compilation_round_id_coder_id_component_id_submission__key" ON "long_compilation"("round_id", "coder_id", "component_id", "submission_number");

-- CreateIndex
CREATE INDEX "system_test_case_component_id_idx" ON "system_test_case"("component_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_test_case_component_id_test_case_id_key" ON "system_test_case"("component_id", "test_case_id");

-- CreateIndex
CREATE INDEX "long_system_test_result_round_id_idx" ON "long_system_test_result"("round_id");

-- CreateIndex
CREATE INDEX "long_system_test_result_coder_id_idx" ON "long_system_test_result"("coder_id");

-- CreateIndex
CREATE UNIQUE INDEX "long_system_test_result_round_id_coder_id_component_id_test_key" ON "long_system_test_result"("round_id", "coder_id", "component_id", "test_case_id", "submission_number");

-- CreateIndex
CREATE INDEX "skill_skill_type_id_idx" ON "skill"("skill_type_id");

-- CreateIndex
CREATE INDEX "coder_skill_xref_coder_id_idx" ON "coder_skill_xref"("coder_id");

-- CreateIndex
CREATE INDEX "coder_skill_xref_skill_id_idx" ON "coder_skill_xref"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "coder_skill_xref_coder_id_skill_id_key" ON "coder_skill_xref"("coder_id", "skill_id");

-- CreateIndex
CREATE INDEX "school_name_idx" ON "school"("name");

-- CreateIndex
CREATE INDEX "school_state_code_idx" ON "school"("state_code");

-- CreateIndex
CREATE INDEX "school_country_code_idx" ON "school"("country_code");

-- CreateIndex
CREATE UNIQUE INDEX "current_school_coder_id_key" ON "current_school"("coder_id");

-- CreateIndex
CREATE INDEX "current_school_school_id_idx" ON "current_school"("school_id");

-- CreateIndex
CREATE INDEX "team_name_idx" ON "team"("name");

-- CreateIndex
CREATE INDEX "team_school_id_idx" ON "team"("school_id");

-- CreateIndex
CREATE INDEX "team_coder_xref_team_id_idx" ON "team_coder_xref"("team_id");

-- CreateIndex
CREATE INDEX "team_coder_xref_coder_id_idx" ON "team_coder_xref"("coder_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_coder_xref_team_id_coder_id_key" ON "team_coder_xref"("team_id", "coder_id");

-- CreateIndex
CREATE INDEX "user_group_xref_user_id_idx" ON "user_group_xref"("user_id");

-- CreateIndex
CREATE INDEX "user_group_xref_group_id_idx" ON "user_group_xref"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_group_xref_user_id_group_id_key" ON "user_group_xref"("user_id", "group_id");

-- CreateIndex
CREATE INDEX "image_image_type_id_idx" ON "image"("image_type_id");

-- CreateIndex
CREATE INDEX "image_path_id_idx" ON "image"("path_id");

-- CreateIndex
CREATE INDEX "coder_image_xref_coder_id_idx" ON "coder_image_xref"("coder_id");

-- CreateIndex
CREATE INDEX "coder_image_xref_image_id_idx" ON "coder_image_xref"("image_id");

-- CreateIndex
CREATE UNIQUE INDEX "coder_image_xref_coder_id_image_id_key" ON "coder_image_xref"("coder_id", "image_id");

-- CreateIndex
CREATE INDEX "user_achievement_user_id_idx" ON "user_achievement"("user_id");

-- CreateIndex
CREATE INDEX "user_achievement_achievement_type_id_idx" ON "user_achievement"("achievement_type_id");

-- CreateIndex
CREATE INDEX "streak_coder_id_idx" ON "streak"("coder_id");

-- CreateIndex
CREATE INDEX "streak_streak_type_id_idx" ON "streak"("streak_type_id");

-- CreateIndex
CREATE INDEX "event_event_type_id_idx" ON "event"("event_type_id");

-- CreateIndex
CREATE INDEX "event_registration_event_id_idx" ON "event_registration"("event_id");

-- CreateIndex
CREATE INDEX "event_registration_user_id_idx" ON "event_registration"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_registration_event_id_user_id_key" ON "event_registration"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "user_notification_user_id_idx" ON "user_notification"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_user_id_notify_id_key" ON "user_notification"("user_id", "notify_id");

-- CreateIndex
CREATE INDEX "calendar_date_idx" ON "calendar"("date");

-- CreateIndex
CREATE INDEX "calendar_year_month_numeric_idx" ON "calendar"("year", "month_numeric");

-- CreateIndex
CREATE INDEX "update_log_log_type_id_idx" ON "update_log"("log_type_id");

-- CreateIndex
CREATE INDEX "update_log_timestamp_idx" ON "update_log"("timestamp");

-- AddForeignKey
ALTER TABLE "coder" ADD CONSTRAINT "coder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder" ADD CONSTRAINT "coder_state_code_fkey" FOREIGN KEY ("state_code") REFERENCES "state"("state_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder" ADD CONSTRAINT "coder_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "country"("country_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder" ADD CONSTRAINT "coder_comp_country_code_fkey" FOREIGN KEY ("comp_country_code") REFERENCES "country"("country_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "algo_rating" ADD CONSTRAINT "algo_rating_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "algo_rating" ADD CONSTRAINT "algo_rating_algo_rating_type_id_fkey" FOREIGN KEY ("algo_rating_type_id") REFERENCES "algo_rating_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "algo_rating" ADD CONSTRAINT "algo_rating_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "algo_rating" ADD CONSTRAINT "algo_rating_first_rated_round_id_fkey" FOREIGN KEY ("first_rated_round_id") REFERENCES "round"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "algo_rating" ADD CONSTRAINT "algo_rating_last_rated_round_id_fkey" FOREIGN KEY ("last_rated_round_id") REFERENCES "round"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "algo_rating_history" ADD CONSTRAINT "algo_rating_history_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "algo_rating_history" ADD CONSTRAINT "algo_rating_history_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "algo_rating_history" ADD CONSTRAINT "algo_rating_history_algo_rating_type_id_fkey" FOREIGN KEY ("algo_rating_type_id") REFERENCES "algo_rating_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_rank" ADD CONSTRAINT "coder_rank_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_rank" ADD CONSTRAINT "coder_rank_coder_rank_type_id_fkey" FOREIGN KEY ("coder_rank_type_id") REFERENCES "coder_rank_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_rank" ADD CONSTRAINT "coder_rank_algo_rating_type_id_fkey" FOREIGN KEY ("algo_rating_type_id") REFERENCES "algo_rating_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_rank_history" ADD CONSTRAINT "coder_rank_history_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_rank_history" ADD CONSTRAINT "coder_rank_history_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_rank_history" ADD CONSTRAINT "coder_rank_history_coder_rank_type_id_fkey" FOREIGN KEY ("coder_rank_type_id") REFERENCES "coder_rank_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_rank_history" ADD CONSTRAINT "coder_rank_history_algo_rating_type_id_fkey" FOREIGN KEY ("algo_rating_type_id") REFERENCES "algo_rating_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country_coder_rank" ADD CONSTRAINT "country_coder_rank_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country_coder_rank" ADD CONSTRAINT "country_coder_rank_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "country"("country_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country_coder_rank" ADD CONSTRAINT "country_coder_rank_algo_rating_type_id_fkey" FOREIGN KEY ("algo_rating_type_id") REFERENCES "algo_rating_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "state_coder_rank" ADD CONSTRAINT "state_coder_rank_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "state_coder_rank" ADD CONSTRAINT "state_coder_rank_state_code_fkey" FOREIGN KEY ("state_code") REFERENCES "state"("state_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "state_coder_rank" ADD CONSTRAINT "state_coder_rank_algo_rating_type_id_fkey" FOREIGN KEY ("algo_rating_type_id") REFERENCES "algo_rating_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_coder_rank" ADD CONSTRAINT "school_coder_rank_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_coder_rank" ADD CONSTRAINT "school_coder_rank_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_coder_rank" ADD CONSTRAINT "school_coder_rank_algo_rating_type_id_fkey" FOREIGN KEY ("algo_rating_type_id") REFERENCES "algo_rating_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round" ADD CONSTRAINT "round_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round" ADD CONSTRAINT "round_round_type_id_fkey" FOREIGN KEY ("round_type_id") REFERENCES "round_type_lu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round" ADD CONSTRAINT "round_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("calendar_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_result" ADD CONSTRAINT "room_result_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_result" ADD CONSTRAINT "room_result_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_result" ADD CONSTRAINT "room_result_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "long_comp_result" ADD CONSTRAINT "long_comp_result_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "long_comp_result" ADD CONSTRAINT "long_comp_result_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem" ADD CONSTRAINT "problem_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "problem_status_lu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_category_xref" ADD CONSTRAINT "problem_category_xref_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component" ADD CONSTRAINT "component_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_component" ADD CONSTRAINT "round_component_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_component" ADD CONSTRAINT "round_component_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_component" ADD CONSTRAINT "round_component_difficulty_id_fkey" FOREIGN KEY ("difficulty_id") REFERENCES "difficulty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "long_problem_submission" ADD CONSTRAINT "long_problem_submission_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "long_submission" ADD CONSTRAINT "long_submission_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "long_submission" ADD CONSTRAINT "long_submission_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "long_component_state" ADD CONSTRAINT "long_component_state_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "long_system_test_result" ADD CONSTRAINT "long_system_test_result_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "long_system_test_result" ADD CONSTRAINT "long_system_test_result_component_id_test_case_id_fkey" FOREIGN KEY ("component_id", "test_case_id") REFERENCES "system_test_case"("component_id", "test_case_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_skill_type_id_fkey" FOREIGN KEY ("skill_type_id") REFERENCES "skill_type_lu"("skill_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_skill_xref" ADD CONSTRAINT "coder_skill_xref_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_skill_xref" ADD CONSTRAINT "coder_skill_xref_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skill"("skill_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school" ADD CONSTRAINT "school_state_code_fkey" FOREIGN KEY ("state_code") REFERENCES "state"("state_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school" ADD CONSTRAINT "school_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "country"("country_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "current_school" ADD CONSTRAINT "current_school_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "current_school" ADD CONSTRAINT "current_school_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "school"("school_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_coder_xref" ADD CONSTRAINT "team_coder_xref_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_coder_xref" ADD CONSTRAINT "team_coder_xref_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_xref" ADD CONSTRAINT "user_group_xref_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "path"("path_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_image_xref" ADD CONSTRAINT "coder_image_xref_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coder_image_xref" ADD CONSTRAINT "coder_image_xref_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image"("image_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_achievement_type_id_fkey" FOREIGN KEY ("achievement_type_id") REFERENCES "achievement_type_lu"("achievement_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak" ADD CONSTRAINT "streak_coder_id_fkey" FOREIGN KEY ("coder_id") REFERENCES "coder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak" ADD CONSTRAINT "streak_start_round_id_fkey" FOREIGN KEY ("start_round_id") REFERENCES "round"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_type_lu"("event_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification" ADD CONSTRAINT "user_notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_log" ADD CONSTRAINT "update_log_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("calendar_id") ON DELETE SET NULL ON UPDATE CASCADE;
