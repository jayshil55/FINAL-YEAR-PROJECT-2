import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Utensils, Moon, Cookie, Salad, Egg, Beef } from 'lucide-react';

const MEAL_PLANS = {
  veg: {
    breakfast: { title: 'Steel-Cut Oats & Berries', desc: 'Topped with chia seeds, crushed almonds, and a touch of cinnamon to stabilize morning blood sugar.' },
    lunch: { title: 'Lentil & Quinoa Bowl with Vegetables', desc: 'Steamed broccoli, spinach, and bell peppers served over sprouted brown rice and olive oil drizzle.' },
    snack: { title: 'Handful of Walnuts & Roasted Chickpeas', desc: 'High-protein, fiber-dense snack to curb afternoon glycemic dips.' },
    dinner: { title: 'Tofu & Vegetable Stir-Fry', desc: 'Sautéed in sesame oil with bok choy, mushrooms, and zucchini with turmeric brown rice.' }
  },
  egg: {
    breakfast: { title: 'Boiled Egg Whites & Avocado Toast', desc: '2 egg whites on whole grain rye bread with avocado mash and pumpkin seeds.' },
    lunch: { title: 'Spinach & Egg Omelet Salad', desc: 'Double-egg white omelet with mushrooms and cherry tomatoes served over fresh arugula.' },
    snack: { title: 'Hard-Boiled Egg with Paprika', desc: 'Quick protein boost paired with a cup of green tea.' },
    dinner: { title: 'Spiced Lentil Soup & Egg Scramble', desc: 'Warm mung bean soup with egg whites scramble and steamed green beans.' }
  },
  'non-veg': {
    breakfast: { title: 'Poached Eggs & Smoked Salmon', desc: 'Paired with grilled asparagus and whole grain sourdough.' },
    lunch: { title: 'Grilled Chicken Breast & Quinoa Salad', desc: 'Seasoned with lemon, herbs, extra virgin olive oil, steamed zucchini, and bell peppers.' },
    snack: { title: 'Handful of Almonds & Cucumber Slices', desc: 'Hydrating, low-carb snack rich in healthy monounsaturated fats.' },
    dinner: { title: 'Baked Omega-3 Salmon & Asparagus', desc: 'Wild-caught salmon fillet with roasted sweet potato wedges and steamed kale.' }
  }
};

export default function MealPlanCard({ activeDiet = 'veg', disease = 'General' }) {
  const plan = MEAL_PLANS[activeDiet] || MEAL_PLANS.veg;

  const mealItems = [
    { type: 'Breakfast', icon: <Coffee className="w-5 h-5 text-amber-500" />, data: plan.breakfast },
    { type: 'Lunch', icon: <Utensils className="w-5 h-5 text-emerald-500" />, data: plan.lunch },
    { type: 'Snack', icon: <Cookie className="w-5 h-5 text-purple-500" />, data: plan.snack },
    { type: 'Dinner', icon: <Moon className="w-5 h-5 text-sky-500" />, data: plan.dinner },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Suggested Daily Meal Protocol
            <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {activeDiet === 'veg' ? 'Vegetarian' : activeDiet === 'egg' ? 'Eggetarian' : 'Non-Vegetarian'} Focus
            </span>
          </h4>
          <p className="text-xs text-slate-500">Structured nutrient-dense meals targeted at {disease} optimization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {mealItems.map((meal, idx) => (
          <motion.div
            key={meal.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="p-5 bg-white/90 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  {meal.icon}
                  {meal.type}
                </span>
              </div>
              <h5 className="text-base font-bold text-slate-900 mb-1">{meal.data.title}</h5>
              <p className="text-xs text-slate-600 leading-relaxed">{meal.data.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
