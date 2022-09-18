function damage(who,amount,sound,shake_){
  who.hurt(amount);
  shake(shake_);
  who.currenthealth=who.currenthealth-amount
  play(sound);
};
export {damage};