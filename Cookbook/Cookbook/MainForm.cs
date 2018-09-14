﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Cookbook
{
    public partial class MainForm : Form
    {
        //private Color BACKCOLOR = Color.Black;
        //private Color HIGHLIGHT = Color.FromArgb(60, 60, 60);

        private const int BACKCOLOR = 0;
        private const int HIGHLIGHT = 60;


        private bool isMouseDown = false;
        private Point firstPoint;

        public MainForm()
        {
            InitializeComponent();

            List<Recipe> recipes = new List<Recipe>()
            {
                new Recipe(0, "Mac 'n Cheese", "Pasta", 15, 2, 500, 0)
            };

            /*
            foreach (Recipe r in recipes)
            {

                dgvRecipes.Rows.Add(r.Name, r.Category, r.PrepTime, r.Servings, r.Calories, r.Quantity);
            }
            */
            dgvRecipes.DataSource = recipes;
        }

        #region TITLE BAR

        private void lblTitle_MouseMove(object sender, MouseEventArgs e)
        {
            if (isMouseDown)
            {
                int x = Location.X - firstPoint.X + e.X;
                int y = Location.Y - firstPoint.Y + e.Y;
                Location = new Point(x, y);
                Update();
            }
        }

        private void lblTitle_MouseDown(object sender, MouseEventArgs e)
        {
            firstPoint = e.Location;
            isMouseDown = true;
        }

        private void lblTitle_MouseUp(object sender, MouseEventArgs e)
        {
            isMouseDown = false;
        }

        private void btnClose_MouseDown(object sender, MouseEventArgs e)
        {
            btnClose.ForeColor = Color.Silver;
        }

        private void btnClose_MouseUp(object sender, MouseEventArgs e)
        {
            btnClose.ForeColor = Color.Gray;
        }

        private void btnClose_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        #endregion

        async private void btnRecipes_MouseDown(object sender, MouseEventArgs e)
        {
            Color fadeColor;
            for (int i = BACKCOLOR; i <= HIGHLIGHT; i+=10)
            {
                fadeColor = Color.FromArgb(i, i, i);
                btnRecipes.BackColor = fadeColor;
                pnlRecipes.BackColor = fadeColor;
                await Delay();
            }
            //btnRecipes.BackColor = HIGHLIGHT;
            //pnlRecipes.BackColor = HIGHLIGHT;
        }

        async private void btnRecipes_MouseUp(object sender, MouseEventArgs e)
        {
            Color fadeColor;
            for (int i = HIGHLIGHT; i >= BACKCOLOR; i-=10)
            {
                fadeColor = Color.FromArgb(i, i, i);
                btnRecipes.BackColor = fadeColor;
                pnlRecipes.BackColor = fadeColor;
                await Delay();
            }

            //btnRecipes.BackColor = BACKCOLOR;
            //pnlRecipes.BackColor = BACKCOLOR;
        }

        async Task Delay()
        {
            await Task.Delay(1);
        }

        private void dgvRecipes_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {
            DataGridView dgv = (DataGridView)sender;

            if (dgv.Columns[e.ColumnIndex] is DataGridViewButtonColumn && e.RowIndex >= 0)
            {
                if (dgv.Columns[e.ColumnIndex] == dgv.Columns["colRemove"])
                {
                    Recipe r = (Recipe)dgvRecipes.CurrentRow.DataBoundItem;
                    if (r.Quantity > 0)
                    {
                        r.Quantity--;
                    }
                }
                else if (dgv.Columns[e.ColumnIndex] == dgv.Columns["colAdd"])
                {
                    Recipe r = (Recipe)dgvRecipes.CurrentRow.DataBoundItem;
                    r.Quantity++;
                }
                else if (dgv.Columns[e.ColumnIndex] == dgv.Columns["colView"])
                {

                }
            }

            dgv.Refresh();
        }
    }
}
