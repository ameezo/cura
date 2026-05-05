"""add doctor_id to medications and notifications table

Revision ID: c8a2f1d93e47
Revises: b40d47ca4c6c
Create Date: 2026-05-05 02:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c8a2f1d93e47'
down_revision = 'b40d47ca4c6c'
branch_labels = None
depends_on = None


def upgrade():
    # --- Add doctor_id column to medications ---
    with op.batch_alter_table('medications', schema=None) as batch_op:
        batch_op.add_column(sa.Column('doctor_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_medications_doctor_id', 'doctors', ['doctor_id'], ['id'])

    # --- Create notifications table ---
    op.create_table('notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('related_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('notifications', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_notifications_id'), ['id'], unique=False)
        batch_op.create_index('ix_notifications_user_id', ['user_id'], unique=False)
        batch_op.create_index('ix_notifications_is_read', ['is_read'], unique=False)


def downgrade():
    with op.batch_alter_table('notifications', schema=None) as batch_op:
        batch_op.drop_index('ix_notifications_is_read')
        batch_op.drop_index('ix_notifications_user_id')
        batch_op.drop_index(batch_op.f('ix_notifications_id'))

    op.drop_table('notifications')

    with op.batch_alter_table('medications', schema=None) as batch_op:
        batch_op.drop_constraint('fk_medications_doctor_id', type_='foreignkey')
        batch_op.drop_column('doctor_id')
