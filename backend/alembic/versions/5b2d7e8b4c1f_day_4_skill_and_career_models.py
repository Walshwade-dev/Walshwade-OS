"""Day 4 skill and career models

Revision ID: 5b2d7e8b4c1f
Revises: 4f1a09eb8657
Create Date: 2026-08-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '5b2d7e8b4c1f'
down_revision: Union[str, None] = '4f1a09eb8657'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'domainenum') THEN
                CREATE TYPE domainenum AS ENUM ('software', 'ai', 'networking', 'cybersecurity', 'business', 'finance', 'communication', 'confidence', 'brand', 'career', 'general');
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skillproficiencylevelenum') THEN
                CREATE TYPE skillproficiencylevelenum AS ENUM ('novice', 'developing', 'competent', 'proficient', 'expert');
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jobopportunitystatusenum') THEN
                CREATE TYPE jobopportunitystatusenum AS ENUM ('interested', 'applied', 'interviewing', 'rejected', 'offer', 'withdrawn');
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contentitemstatusenum') THEN
                CREATE TYPE contentitemstatusenum AS ENUM ('idea', 'draft', 'published');
            END IF;
        END $$;
        """
    )

    op.create_table(
        'skills',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('domain', postgresql.ENUM('software', 'ai', 'networking', 'cybersecurity', 'business', 'finance', 'communication', 'confidence', 'brand', 'career', 'general', name='domainenum', create_type=False), nullable=False),
        sa.Column('proficiency_level', postgresql.ENUM('novice', 'developing', 'competent', 'proficient', 'expert', name='skillproficiencylevelenum', create_type=False), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_skills_id'), 'skills', ['id'], unique=False)

    op.create_table(
        'skill_evidence',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('skill_id', sa.UUID(), nullable=False),
        sa.Column('task_id', sa.UUID(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('evidence_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_skill_evidence_id'), 'skill_evidence', ['id'], unique=False)

    op.create_table(
        'job_opportunities',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('company', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=True),
        sa.Column('required_skills', sa.ARRAY(sa.String()), nullable=False, server_default='{}'),
        sa.Column('status', postgresql.ENUM('interested', 'applied', 'interviewing', 'rejected', 'offer', 'withdrawn', name='jobopportunitystatusenum', create_type=False), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_job_opportunities_id'), 'job_opportunities', ['id'], unique=False)

    op.create_table(
        'content_items',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('source_task_id', sa.UUID(), nullable=True),
        sa.Column('status', postgresql.ENUM('idea', 'draft', 'published', name='contentitemstatusenum', create_type=False), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['source_task_id'], ['tasks.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_content_items_id'), 'content_items', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_content_items_id'), table_name='content_items')
    op.drop_table('content_items')

    op.drop_index(op.f('ix_job_opportunities_id'), table_name='job_opportunities')
    op.drop_table('job_opportunities')

    op.drop_index(op.f('ix_skill_evidence_id'), table_name='skill_evidence')
    op.drop_table('skill_evidence')

    op.drop_index(op.f('ix_skills_id'), table_name='skills')
    op.drop_table('skills')
