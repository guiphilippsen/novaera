import SystemDataModel from "../abstract.mjs";
import ActionTemplate from "./templates/action.mjs";
import ActivatedEffectTemplate from "./templates/activated-effect.mjs";
import EquippableItemTemplate from "./templates/equippable-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";
import MountableTemplate from "./templates/mountable.mjs";

/**
 * Data definition for Equipment items.
 * @mixes ItemDescriptionTemplate
 * @mixes PhysicalItemTemplate
 * @mixes EquippableItemTemplate
 * @mixes ActivatedEffectTemplate
 * @mixes ActionTemplate
 * @mixes MountableTemplate
 *
 * @property {object} armor             Armor details and equipment type information.
 * @property {string} armor.type        Equipment type as defined in `DND5E.equipmentTypes`.
 * @property {number} armor.value       Base armor class or shield bonus.
 * @property {number} armor.dex         Maximum dex bonus added to armor class.
 * @property {string} baseItem          Base armor as defined in `DND5E.armorIds` for determining proficiency.
 * @property {object} speed             Speed granted by a piece of vehicle equipment.
 * @property {number} speed.value       Speed granted by this piece of equipment measured in feet or meters
 *                                      depending on system setting.
 * @property {string} speed.conditions  Conditions that may affect item's speed.
 * @property {number} strength          Minimum strength required to use a piece of armor.
 * @property {boolean} stealth          Does this equipment grant disadvantage on stealth checks when used?
 * @property {boolean} proficient       Does the owner have proficiency in this piece of equipment?
 */
export default class EquipmentData extends SystemDataModel.mixin(
  ItemDescriptionTemplate, PhysicalItemTemplate, EquippableItemTemplate,
  ActivatedEffectTemplate, ActionTemplate, MountableTemplate
) {
  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      armor: new foundry.data.fields.SchemaField({
        type: new foundry.data.fields.StringField({
          required: true, initial: "light", label: "DND5E.ItemEquipmentType"
        }),
        value: new foundry.data.fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.ArmorClass"}),
        dex: new foundry.data.fields.NumberField({required: true, integer: true, label: "DND5E.ItemEquipmentDexMod"})
      }, {label: ""}),
      baseItem: new foundry.data.fields.StringField({required: true, label: "DND5E.ItemEquipmentBase"}),
      speed: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.Speed"}),
        conditions: new foundry.data.fields.StringField({required: true, label: "DND5E.SpeedConditions"})
      }, {label: "DND5E.Speed"}),
      strength: new foundry.data.fields.NumberField({
        required: true, integer: true, min: 0, label: "DND5E.ItemRequiredStr"
      }),
      stealth: new foundry.data.fields.BooleanField({required: true, label: "DND5E.ItemEquipmentStealthDisav"}),
      proficient: new foundry.data.fields.BooleanField({required: true, initial: true, label: "DND5E.Proficient"})
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    super.migrateData(source);
    EquipmentData.#migrateArmor(source);
    EquipmentData.#migrateStrength(source);
  }

  /* -------------------------------------------- */

  /**
   * Apply migrations to the armor field.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static #migrateArmor(source) {
    source.armor ??= {};
    if ( source.armor.type === "bonus" ) source.armor.type = "trinket";
    if ( (typeof source.armor.dex === "string") ) {
      const dex = source.armor.dex;
      if ( dex === "" ) source.armor.dex = null;
      else if ( Number.isNumeric(dex) ) source.armor.dex = Number(dex);
    }
  }

  /* -------------------------------------------- */

  /**
   * Ensure blank strength values are migrated to null, and string values are converted to numbers.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static #migrateStrength(source) {
    if ( typeof source.strength !== "string" ) return;
    if ( source.strength === "" ) source.strength = null;
    if ( Number.isNumeric(source.strength) ) source.strength = Number(source.strength);
  }
}
